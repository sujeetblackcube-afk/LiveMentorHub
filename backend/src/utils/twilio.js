import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const sendSMS = async (to, message) => {
  try {
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });

    // console.log("SMS Sent:", res.sid);
    return true;
  } catch (error) {
    console.error("Twilio Error:", error.message);
    return false;
  }
};