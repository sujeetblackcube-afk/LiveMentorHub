import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { generateEnrollmentPDF } from "./generateEnrollmentPDF.js"; // Adjust relative path as needed

export const notifyEnrollmentConfirmation = async (enrollment, userEmail, companyDetails = {}) => {
  console.log("Preparing to send enrollment confirmation email to:", userEmail);
  let tempFilePath = null;

  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_PASS;

    if (!gmailUser || !gmailPass) {
      console.error('Gmail credentials not configured. Please set GMAIL_USER and GMAIL_PASS in .env file');
      return false;
    }

    // Check payment status
    const isPaid = String(enrollment.paymentStatus).toLowerCase() === "paid";
    
    // 1. Conditionally generate & save the PDF ONLY if payment is paid
    const attachments = [];
    if (isPaid) {
      const pdfBuffer = await generateEnrollmentPDF(enrollment, companyDetails);

      const tempDir = path.resolve("temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const filename = `Enrollment_Invoice_${enrollment.enrollmentCode || enrollment.id}.pdf`;
      tempFilePath = path.join(tempDir, filename);
      
      fs.writeFileSync(tempFilePath, pdfBuffer);

      attachments.push({
        filename: filename,
        path: tempFilePath,
      });
    }

    // 2. Transporter Setup
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    // Formatting Dates
    const formattedStartDate = enrollment.courseStartDate 
      ? new Date(enrollment.courseStartDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "N/A";

    const formattedExpiryDate = enrollment.courseExpiryDate || enrollment.enrollmentExpireDate
      ? new Date(enrollment.courseExpiryDate || enrollment.enrollmentExpireDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : "N/A";

    // 3. Dynamic Messaging based on Enrollment & Payment
    const subject = isPaid 
      ? `Enrollment Successful: ${enrollment.courseName}`
      : `Action Required: Enrollment Pending Payment for ${enrollment.courseName}`;

    const headerMessage = isPaid
      ? `<h2 style="color: #2c3e50; margin-top: 0;">Welcome to ${enrollment.courseName}! 🎓</h2>
         <p>Hi <strong>${enrollment.studentName}</strong>, your enrollment has been successfully confirmed.</p>`
      : `<h2 style="color: #dc2626; margin-top: 0;">Enrollment Unsuccessful ⚠️</h2>
         <p>Hi <strong>${enrollment.studentName}</strong>, your payment attempt for <strong>${enrollment.courseName}</strong> was unsuccessful or is pending.</p>`;

    const amountLabel = isPaid ? "Amount Paid" : "Amount Due";
    const displayedAmount = enrollment.amountPaid || enrollment.coursePrice || 0;

    const invoiceNote = isPaid 
      ? `<p style="color: #16a34a; font-weight: bold;">Your enrollment status is active. Please find your official enrollment invoice attached to this email.</p>`
      : `<p style="color: #dc2626; font-weight: bold;">Note: Please complete your payment to activate course access. No invoice was generated.</p>`;

    // 4. Email Options
    const mailOptions = {
      from: `"Live Mentor Hub" <${gmailUser}>`,
      to: userEmail,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          ${headerMessage}
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Enrollment Details</h4>
            <p style="margin: 5px 0;"><strong>Student Name:</strong> ${enrollment.studentName}</p>
            <p style="margin: 5px 0;"><strong>Enrollment Code:</strong> ${enrollment.enrollmentCode}</p>
            <p style="margin: 5px 0;"><strong>Course Name:</strong> ${enrollment.courseName} (${enrollment.courseCode})</p>
            <p style="margin: 5px 0;"><strong>${amountLabel}:</strong> ${enrollment.currency || 'INR'} ₹${Number(displayedAmount).toFixed(2)}</p>
            ${enrollment.transactionNumber ? `<p style="margin: 5px 0;"><strong>Transaction Ref:</strong> ${enrollment.transactionNumber}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Access Validity:</strong> ${formattedStartDate} to ${formattedExpiryDate}</p>
          </div>

          ${invoiceNote}
          <p style="color: #777; font-size: 12px; margin-top: 20px;">If you have any questions or need technical support, reply directly to this email.</p>
        </div>
      `,
      attachments: attachments,
    };

    // 5. Send Mail
    const info = await transporter.sendMail(mailOptions);
    console.log('Enrollment email sent to %s: %s', userEmail, info.messageId);

    return true;
  } catch (error) {
    console.error('Error sending enrollment confirmation email:', error.message);
    return false;
  } finally {
    // 6. Temp PDF Cleanup
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
