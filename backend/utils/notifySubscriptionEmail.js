import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { generateSubscriptionInvoicePDF } from "../utils/generateSubscriptionInvoicePDF.js"; 

export const notifySubscriptionConfirmation = async (subscription, userEmail, companyDetails = {}) => {
  let tempFilePath = null;

  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    if (!gmailUser || !gmailPass) {
      console.error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_PASS in .env file');
      return false;
    }

    // Check if the payment was successful
    const isPaid = String(subscription.paymentStatus).toLowerCase() === "paid";
    
    // 1. Conditionally generate & save the PDF ONLY if payment is paid
    const attachments = [];
    if (isPaid) {
      const pdfBuffer = await generateSubscriptionInvoicePDF(subscription, companyDetails);

      const tempDir = path.resolve("temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const filename = `Invoice_${subscription.orderId || subscription.id}.pdf`;
      tempFilePath = path.join(tempDir, filename);
      
      fs.writeFileSync(tempFilePath, pdfBuffer);

      attachments.push({
        filename: filename,
        path: tempFilePath,
      });
    }

    // 2. Configure Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const formattedStartDate = new Date(subscription.startDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const formattedEndDate = new Date(subscription.endDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // 3. Dynamic Email Messaging
    const subject = isPaid 
      ? `Subscription Confirmed: ${subscription.planName}`
      : `Payment Failed: Subscription Attempt for ${subscription.planName}`;

    const headerMessage = isPaid
      ? `<h2 style="color: #2c3e50; margin-top: 0;">Subscription Confirmed! 🎉</h2>
         <p>Hi, thank you for subscribing to <strong>${subscription.planName}</strong>'s plan.</p>`
      : `<h2 style="color: #dc2626; margin-top: 0;">Payment Failed ⚠️</h2>
         <p>Hi, your payment attempt for <strong>${subscription.planName}</strong>'s plan was unsuccessful. Please try again or update your payment details.</p>`;

    const amountLabel = isPaid ? "Amount Paid" : "Amount Pending";
    
    const invoiceNote = isPaid 
      ? `<p>Please find your official subscription invoice attached to this email.</p>`
      : `<p style="color: #dc2626; font-weight: bold;">Note: No invoice was issued as the payment is incomplete.</p>`;

    // 4. Configure Email Options
    const mailOptions = {
      from: `"Live Mentor Hub" <${gmailUser}>`,
      to: userEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          ${headerMessage}
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333;">Order Summary</h4>
            <p style="margin: 5px 0;"><strong>Plan:</strong> ${subscription.planName}</p>
            <p style="margin: 5px 0;"><strong>Teacher:</strong> ${subscription.teacherName}</p>
            <p style="margin: 5px 0;"><strong>Duration:</strong> ${subscription.durationDays} Days</p>
            <p style="margin: 5px 0;"><strong>${amountLabel}:</strong> ₹${Number(subscription.price || 0).toFixed(2)}</p>
            <p style="margin: 5px 0;"><strong>Valid From:</strong> ${formattedStartDate} to ${formattedEndDate}</p>
          </div>

          ${invoiceNote}
          <p style="color: #777; font-size: 12px;">If you have any questions, reply to this email or contact support.</p>
        </div>
      `,
      attachments: attachments,
    };

    // 5. Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);

    return true;
  } catch (error) {
    console.error('Error sending subscription confirmation email:', error.message);
    return false;
  } finally {
    // 6. Safe Cleanup
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log(`Successfully cleaned up temp file: ${tempFilePath}`);
      } catch (cleanupErr) {
        console.error(`Failed to delete temporary PDF file (${tempFilePath}):`, cleanupErr.message);
      }
    }
  }
};
