/**
 * Authentication utility helpers.
 * Keeps auth-specific reusable logic separate from the service layer.
 */

import bcrypt from "bcrypt";
import crypto from "crypto";
import axios from "axios";
import { generateOTP, verifyOTP, sendOTP } from "../utils/otp.js";

export const getClientIp = async (req) => {
  let ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    req.ip ||
    null;

  if (ip && ip.includes("::ffff:")) {
    ip = ip.split("::ffff:")[1];
  }

  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    try {
      const response = await axios.get("https://api.ipify.org?format=json", {
        timeout: 2000,
      });
      ip = response.data.ip;
    } catch (error) {
      console.error("IP fetch API failed:", error.message);
      ip = "UNKNOWN";
    }
  }

  return ip;
};

export const generateStudentId = async (firstName) => {
  const now = new Date();

  const dateTime =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const random = crypto.randomInt(10, 100);
  return `${firstName}${dateTime}${random}`;
};

export const generateTeacherId = async (firstName) => {
  const now = new Date();

  const dateTime =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const random = crypto.randomInt(10, 100);
  return `${firstName}${dateTime}${random}`;
};

export const generateParentId = async (firstName) => {
  const now = new Date();

  const dateTime =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    String(now.getHours()).padStart(2, "0") +
    String(now.getMinutes()).padStart(2, "0") +
    String(now.getSeconds()).padStart(2, "0");

  const random = crypto.randomInt(10, 100);
  return `${firstName}${dateTime}${random}`;
};

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const generateAndSendOTP = async (email) => {
  const otp = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await sendOTP(email, otp);

  return { otp, otpExpiresAt };
};

export const isOtpValid = (otp, storedOtp, expiresAt) => {
  return verifyOTP(otp, storedOtp, expiresAt);
};
