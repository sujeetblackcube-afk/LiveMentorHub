import { randomInt } from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Generate a 6-digit OTP
export const generateOTP = () => {
  return randomInt(100000, 999999).toString();
};

// Verify OTP: check if provided otp matches stored otp and not expired
export const verifyOTP = (providedOtp, storedOtp, expiresAt) => {
  if (!storedOtp || !expiresAt) return false;
  if (new Date() > new Date(expiresAt)) return false;
  return providedOtp === storedOtp;
};

// Send OTP via email using Gmail SMTP
export const sendOTP = async (email, otp) => {
  try {
    // Get Gmail credentials from environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    // Check if credentials are configured
    if (!gmailUser || !gmailPass) {
      console.error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_PASS in .env file');
      // console.log(`OTP ${otp} sent to ${email} (EMAIL NOT SENT - Gmail not configured)`);
      return false;
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // Email content
    const mailOptions = {
  from: `"Live Mentor Hub" <${gmailUser}>`,
  to: email,
  subject: "Live Mentor Hub - OTP Verification Code",
  html: `
  <div style="margin:0;padding:0;background-color:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08);overflow:hidden;">
      
      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#4CAF50,#2E7D32);padding:25px;text-align:center;">
          <h1 style="color:#ffffff;margin:0;font-size:22px;letter-spacing:1px;">
            Live Mentor Hub
          </h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:35px 30px;">
          <h2 style="margin:0 0 15px 0;color:#333333;font-size:20px;">
            OTP Verification
          </h2>

          <p style="color:#555555;font-size:15px;line-height:1.6;margin-bottom:25px;">
            Hello,<br><br>
            Thank you for using <strong>Live Mentor Hub</strong>. 
            Please use the following One-Time Password (OTP) to complete your verification process:
          </p>

          <div style="text-align:center;margin:30px 0;">
            <span style="display:inline-block;padding:15px 25px;font-size:32px;font-weight:bold;
              color:#2E7D32;background:#E8F5E9;border-radius:8px;letter-spacing:6px;">
              ${otp}
            </span>
          </div>

          <p style="text-align:center;color:#777777;font-size:14px;margin-top:10px;">
            ⏳ This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p style="color:#888888;font-size:13px;margin-top:30px;line-height:1.6;">
            If you did not request this verification code, please ignore this email. 
            For security reasons, do not share your OTP with anyone.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f9f9f9;padding:20px;text-align:center;font-size:12px;color:#999999;">
          © ${new Date().getFullYear()} Live Mentor Hub. All rights reserved.<br>
          This is an automated message, please do not reply to this email.
        </td>
      </tr>

    </table>
  </div>
  `,
};

    // Send email
    const info = await transporter.sendMail(mailOptions);
    // console.log(`OTP ${otp} sent successfully to ${email}`);
    // console.log('Email sent: %s', info.messageId);
    
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    // console.log(`OTP ${otp} sent to ${email} (EMAIL FAILED)`);
    return false;
  }
};
