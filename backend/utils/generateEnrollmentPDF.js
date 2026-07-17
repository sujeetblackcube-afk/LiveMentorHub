import PDFDocument from "pdfkit";
import path from "path";
import fs from "fs";

export const generateEnrollmentPDF = (enrollment, company = {}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
    });

    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));

    /* ===============================
       LOAD LOGO (SMART FALLBACK)
    ================================ */
    let logoPath = null;

    if (company.logoPath) {
      const resolved = path.resolve(company.logoPath);
      if (fs.existsSync(resolved)) logoPath = resolved;
    }

    if (!logoPath) {
      const defaultLogo = path.resolve("uploads/company/logo.png");
      if (fs.existsSync(defaultLogo)) logoPath = defaultLogo;
    }

    /* ===============================
       THEME COLORS (MODERN LMS STYLE)
    ================================ */
    const primary = "#0f172a"; // navy
    const secondary = "#2563eb"; // blue accent
    const lightGray = "#f1f5f9";
    const border = "#e2e8f0";

    const price = Number(enrollment.amountPaid || 0);
    const currency = enrollment.currency || "INR";
    const formattedPrice = `${price.toLocaleString()} ${currency}`;

    /* ===============================
       HEADER BACKGROUND
    ================================ */
    doc.rect(0, 0, 595, 120).fill(primary);

    // Accent strip
    doc.rect(0, 110, 595, 10).fill(secondary);

    /* ===============================
       COMPANY BRANDING
    ================================ */
    // Company Logo (LEFT) - Circular Design
    if (logoPath) {
      const logoX = 45;
      const logoY = 25;
      const logoRadius = 35;

      // White circle background
      doc.circle(logoX, logoY, logoRadius).fill("#ffffff");

      // Draw logo clipped to circle using rectangle clipping
      doc.save();
      doc.circle(logoX, logoY, logoRadius - 2);
      doc.clip();
      doc.image(logoPath, logoX - logoRadius + 2, logoY - logoRadius + 2, {
        fit: [(logoRadius - 2) * 2, (logoRadius - 2) * 2],
        align: "center",
        valign: "center",
      });
      doc.restore();
    }
    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(24)
      .text(company.name || "LiveMentorHub", 50, 35, {
        align: "right",
        width: 505,
      });

    doc
      .fontSize(11)
      .font("Helvetica")
      .text(company.email || "support@livementorhub.com", 50, 70, {
        align: "right",
        width: 505,
      });

    /* ===============================
       INVOICE TITLE + BADGE
    ================================ */
    doc
      .fillColor("#000")
      .font("Helvetica-Bold")
      .fontSize(26)
      .text("ENROLLMENT INVOICE", 40, 150);

    // Status Badge
    const status = enrollment.paymentStatus || "PENDING";
    const badgeColor = status === "PAID" ? "#16a34a" : "#f59e0b";

    doc.roundedRect(420, 150, 120, 30, 15).fill(badgeColor);

    doc
      .fillColor("#fff")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(status, 420, 158, { width: 120, align: "center" });

    doc
      .fillColor("gray")
      .fontSize(11)
      .font("Helvetica")
      .text("Auto Generated Receipt", 40, 185);

    /* ===============================
       BILLING SECTION CARDS
    ================================ */
    const cardTop = 220;

    // Student Card
    doc.roundedRect(40, cardTop, 250, 130, 10).fill(lightGray);
    doc.strokeColor(border).stroke();

    doc
      .fillColor(primary)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Bill To", 55, cardTop + 15);

    doc
      .fillColor("#000")
      .font("Helvetica")
      .fontSize(11)
      .text(`Name: ${enrollment.studentName || "-"}`, 55, cardTop + 45)
      .text(`Email: ${enrollment.studentEmail || "-"}`, 55, cardTop + 65)
      .text(`Mobile: ${enrollment.studentMobile || "-"}`, 55, cardTop + 85);

    // Invoice Details Card
    doc.roundedRect(305, cardTop, 250, 130, 10).fill(lightGray);
    doc.strokeColor(border).stroke();

    doc
      .fillColor(primary)
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("Invoice Details", 320, cardTop + 15);

    doc
      .fillColor("#000")
      .fontSize(11)
      .font("Helvetica")
      .text(
        `Enrollment No: ${enrollment.enrollmentCode || "-"}`,
        320,
        cardTop + 45,
      )
      .text(`Issue Date: ${enrollment.paymentDate || "-"}`, 320, cardTop + 65)
      .text(`Course Code: ${enrollment.courseCode || "-"}`, 320, cardTop + 95)
      .text(
        `Expiry Date: ${enrollment.enrollmentExpireDate || "-"}`,
        320,
        cardTop + 115,
      );

    /* ===============================
       COURSE TABLE (MODERN)
    ================================ */
    const tableTop = 390;

    // Table Header
    doc.roundedRect(40, tableTop, 515, 35, 8).fill(primary);

    doc
      .fillColor("#fff")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Course Description", 60, tableTop + 10)
      .text("Qty", 320, tableTop + 10)
      .text("Price", 380, tableTop + 10)
      .text("Total", 470, tableTop + 10);

    // Row Background
    doc.roundedRect(40, tableTop + 40, 515, 50, 8).fill("#ffffff");
    doc.strokeColor(border).stroke();

    doc
      .fillColor("#000")
      .font("Helvetica")
      .fontSize(12)
      .text(enrollment.courseName || "Course Enrollment", 60, tableTop + 58)
      .text("1", 330, tableTop + 58)
      .text(formattedPrice, 380, tableTop + 58)
      .text(formattedPrice, 470, tableTop + 58);

    /* ===============================
       TOTAL SUMMARY BOX (PREMIUM)
    ================================ */
    const summaryTop = tableTop + 120;

    doc.roundedRect(320, summaryTop, 235, 130, 12).fill(lightGray);
    doc.strokeColor(border).stroke();

    doc
      .fillColor("#000")
      .fontSize(12)
      .font("Helvetica")
      .text("Subtotal", 340, summaryTop + 25)
      .text(formattedPrice, 470, summaryTop + 25);

    doc
      .text("Tax (0%)", 340, summaryTop + 55)
      .text(`0 ${currency}`, 470, summaryTop + 55);

    doc
      .moveTo(330, summaryTop + 85)
      .lineTo(540, summaryTop + 85)
      .stroke(border);

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor(secondary)
      .text("Total Paid", 340, summaryTop + 95)
      .text(formattedPrice, 470, summaryTop + 95);

    /* ===============================
       THANK YOU MESSAGE
    ================================ */
    doc
      .fillColor("gray")
      .fontSize(11)
      .font("Helvetica-Oblique")
      .text(
        "Thank you for enrolling with us! This invoice confirms your successful registration and payment.",
        40,
        640,
        { align: "center", width: 515 },
      );

    /* ===============================
       FOOTER (PROFESSIONAL)
    ================================ */
    doc.rect(0, 700, 595, 100).fill(primary);

    doc
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(company.name || "LiveMentorHub", 40, 720);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(company.address || "Nehru Place, New Delhi", 40, 740)
      .text(`Email: ${company.email || "support@livementorhub.com"}`, 250, 740)
      .text(`Phone: ${company.phone || "+91 0000000000"}`, 420, 740);

    doc.end();
  });
};
