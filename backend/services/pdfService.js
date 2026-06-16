import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Compile prescription data into HTML.
 */
const generatePrescriptionHtml = (prescription, doctorName, patientName, patientAge, dateString) => {
  const medicinesRows = prescription.medicines
    .map(
      (med) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight: 500; color: #1E293B;">${med.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; color: #475569;">${med.dosage}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; color: #475569;">${med.frequency}</td>
        <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; color: #475569;">${med.duration}</td>
      </tr>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Prescription</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #F8FAFC; padding: 40px; margin: 0; color: #0F172A; }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); max-width: 800px; margin: 0 auto; padding: 40px; border-top: 8px solid #2563EB; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #E2E8F0; padding-bottom: 20px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 800; color: #2563EB; }
        .doctor-info { text-align: right; }
        .doctor-info h2 { margin: 0; font-size: 20px; color: #1E293B; }
        .doctor-info p { margin: 4px 0; color: #64748B; font-size: 14px; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .patient-box { background-color: #F1F5F9; padding: 15px; border-radius: 8px; }
        .patient-box h3 { margin: 0 0 8px 0; font-size: 16px; color: #0E7490; }
        .patient-box p { margin: 4px 0; font-size: 14px; color: #475569; }
        .rx-title { font-size: 28px; font-weight: 700; color: #4338CA; margin-bottom: 15px; display: flex; align-items: center; }
        .med-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .med-table th { background-color: #F8FAFC; text-align: left; padding: 10px; border-bottom: 2px solid #E2E8F0; font-weight: 600; color: #475569; }
        .notes-section { background-color: #FFFBEB; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 30px; }
        .notes-section h4 { margin: 0 0 6px 0; color: #B45309; }
        .notes-section p { margin: 0; font-size: 14px; color: #78350F; }
        .footer { text-align: center; border-top: 1px solid #E2E8F0; padding-top: 20px; margin-top: 40px; font-size: 12px; color: #94A3B8; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">MediConnect Pro™</div>
          <div class="doctor-info">
            <h2>Dr. ${doctorName}</h2>
            <p>MediConnect Verified Practitioner</p>
          </div>
        </div>
        <div class="details-grid">
          <div class="patient-box">
            <h3>Patient Information</h3>
            <p><strong>Name:</strong> ${patientName}</p>
            <p><strong>Age:</strong> ${patientAge} years</p>
          </div>
          <div class="patient-box" style="text-align: right;">
            <h3>Prescription Metadata</h3>
            <p><strong>Date:</strong> ${dateString}</p>
            <p><strong>Ref:</strong> RX-${prescription._id.toString().substring(18).toUpperCase()}</p>
          </div>
        </div>
        <div class="rx-title">Rₓ</div>
        <table class="med-table">
          <thead>
            <tr>
              <th>Medicine Name</th>
              <th>Dosage</th>
              <th>Frequency</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            ${medicinesRows}
          </tbody>
        </table>
        ${prescription.advice ? `
          <div class="notes-section">
            <h4>Advice / Instructions</h4>
            <p>${prescription.advice}</p>
          </div>
        ` : ''}
        ${prescription.notes ? `
          <div class="notes-section" style="background-color: #F0FDF4; border-left-color: #10B981;">
            <h4 style="color: #15803D;">Consultation Notes</h4>
            <p style="color: #166534;">${prescription.notes}</p>
          </div>
        ` : ''}
        <div class="footer">
          This prescription was electronically generated and signed via MediConnect Pro™ telemedicine systems.
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate PDF prescription file.
 */
export const compilePrescriptionPdf = async (prescription, doctorName, patientName, patientAge) => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const rxDir = path.join(uploadsDir, 'prescriptions');

  // Ensure directories exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  if (!fs.existsSync(rxDir)) {
    fs.mkdirSync(rxDir);
  }

  const fileName = `prescription_${prescription._id}.pdf`;
  const pdfFilePath = path.join(rxDir, fileName);
  const relativePath = `uploads/prescriptions/${fileName}`;

  const dateString = new Date(prescription.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const htmlContent = generatePrescriptionHtml(prescription, doctorName, patientName, patientAge, dateString);

  try {
    // Launch Chrome to render PDF
    console.log('Launching Puppeteer to generate prescription PDF...');
    const browser = await puppeteer.launch({
      executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    await page.pdf({
      path: pdfFilePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm',
      },
    });
    await browser.close();
    console.log(`Prescription PDF generated at: ${pdfFilePath}`);
    return relativePath;
  } catch (error) {
    console.error('Puppeteer PDF generation failed, falling back to writing HTML receipt:', error.message);
    // Graceful fallback: Write HTML representation if PDF generation fails (which is valid and prevents crashes)
    const fallbackHtmlName = `prescription_${prescription._id}.html`;
    const fallbackHtmlPath = path.join(rxDir, fallbackHtmlName);
    fs.writeFileSync(fallbackHtmlPath, htmlContent);
    return `uploads/prescriptions/${fallbackHtmlName}`;
  }
};
