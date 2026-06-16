import nodemailer from 'nodemailer';

const isEmailConfigured = () => {
  return process.env.EMAIL_USER && process.env.EMAIL_PASS;
};

let transporter;
if (isEmailConfigured()) {
  transporter = nodemailer.createTransport({
    service: 'gmail', // Defaulting to Gmail, can be customized
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
} else {
  console.log('Nodemailer not configured. All email dispatches will be output to console logs.');
}

/**
 * Send an email notification.
 * @param {string} to Recipient email
 * @param {string} subject Email subject
 * @param {string} html HTML body
 */
export const sendEmail = async (to, subject, html) => {
  if (isEmailConfigured()) {
    try {
      const mailOptions = {
        from: `"MedConnect Care" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      };
      await transporter.sendMail(mailOptions);
      console.log(`Email successfully dispatched to ${to}: "${subject}"`);
    } catch (error) {
      console.error(`Failed to send email to ${to}:`, error.message);
    }
  } else {
    console.log('\n==================================================');
    console.log(`SIMULATED EMAIL DISPATCH`);
    console.log(`To:      ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:    ${html.replace(/<[^>]*>/g, ' ').substring(0, 200)}...`);
    console.log('==================================================\n');
  }
};
