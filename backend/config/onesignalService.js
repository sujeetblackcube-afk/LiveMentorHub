import axios from "axios";
import dotenv from "dotenv";
import  Login  from "../models/Login.js";
import pkg from 'sequelize';
const { Op } = pkg;

dotenv.config();

const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_REST_API_KEY;
const ONESIGNAL_URL = "https://onesignal.com/api/v1/notifications";

/* =========================================================
   🔔 SEND DIRECTLY TO PLAYER IDS
========================================================= */
export const sendToPlayerIds = async (
  playerIds,
  title,
  message,
  data = {}
) => {
  try {
    if (!playerIds || playerIds.length === 0) {
      // console.log("⚠️ No playerIds to send notification");
      return;
    }

    // Allow only valid UUID format
    const validPlayerIds = playerIds.filter(
      (id) =>
        typeof id === "string" &&
        id.length > 30 &&
        id.includes("-")
    );

    if (validPlayerIds.length === 0) {
      // console.log("⚠️ No valid OneSignal playerIds found");
      return;
    }

    const response = await axios.post(
      ONESIGNAL_URL,
      {
        app_id: ONESIGNAL_APP_ID,
        include_player_ids: validPlayerIds,
        headings: { en: title },
        contents: { en: message },
        data,
      },
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("✅ Notification Sent:", response.data.id);
    return response.data;
  } catch (error) {
    console.error(
      "❌ OneSignal Error:",
      error.response?.data || error.message
    );
  }
};

/* =========================================================
   🔔 SEND BY ROLE TAG (Optional Feature)
========================================================= */
export const sendByRole = async (roles, title, message) => {
  try {
    const filters = [];

    roles.forEach((role, index) => {
      if (index !== 0) filters.push({ operator: "OR" });
      filters.push({
        field: "tag",
        key: "role",
        relation: "=",
        value: role,
      });
    });

    await axios.post(
      ONESIGNAL_URL,
      {
        app_id: ONESIGNAL_APP_ID,
        filters,
        headings: { en: title },
        contents: { en: message },
      },
      {
        headers: {
          Authorization: `Basic ${ONESIGNAL_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // console.log("✅ Role Notification Sent");
  } catch (error) {
    console.error(
      "❌ Role Notification Error:",
      error.response?.data || error.message
    );
  }
};

/* =========================================================
   🔥 CENTRAL TRIGGER FUNCTION (BEST PRACTICE)
   Called AFTER Notification rows are inserted
========================================================= */
export const triggerPushForNotifications = async (notifications) => {
  try {
    if (!notifications || notifications.length === 0) return;

    // Remove deleted notifications if soft delete used
    const activeNotifications = notifications.filter(
      (n) => !n.isDeleted
    );

    if (activeNotifications.length === 0) return;

    // Extract unique specificIds and roles
    const specificIds = [
      ...new Set(activeNotifications.map((n) => n.specificId)),
    ];

    const roles = [
      ...new Set(activeNotifications.map((n) => n.role)),
    ];

    // 🔥 SINGLE OPTIMIZED QUERY
    const logins = await Login.findAll({
      where: {
        specificId: { [Op.in]: specificIds },
        role: { [Op.in]: roles },
        status: "success",
        playerId: { [Op.ne]: null },
      },
      attributes: ["specificId", "playerId", "attemptTime"],
      order: [
        ["specificId", "ASC"],
        ["attemptTime", "DESC"], // latest login first
      ],
    });

    if (!logins || logins.length === 0) {
      // console.log("⚠️ No active login devices found");
      return;
    }

    // 🔥 Get ONLY latest device per user
    const latestPlayerMap = new Map();

    for (const login of logins) {
      if (!latestPlayerMap.has(login.specificId)) {
        latestPlayerMap.set(login.specificId, login.playerId);
      }
    }

    const playerIds = [
      ...new Set(
        Array.from(latestPlayerMap.values()).filter(
          (id) =>
            typeof id === "string" &&
            id.length > 30 &&
            id.includes("-")
        )
      ),
    ];

    if (playerIds.length === 0) {
      // console.log("⚠️ No valid playerIds found");
      return;
    }

    // Use first notification for title/message (bulk same type)
    const first = activeNotifications[0];

    await sendToPlayerIds(
      playerIds,
      first.title,
      first.message,
      {
        type: first.type,
        referenceId: first.referenceId,
      }
    );

    // console.log(
    //   `🚀 Push sent to ${playerIds.length} devices for roles:`,
    //   roles
    // );
  } catch (error) {
    console.error("❌ Multi-Role Push Error:", error.message);
  }
};