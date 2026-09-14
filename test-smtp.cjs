require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function main() {
  try {
    console.log('Testing SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Optional: Send a test email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_USER,
      subject: "Test Email from CoderNest Portal",
      text: "If you receive this, SMTP is configured correctly.",
    });
    console.log('✅ Test email sent:', info.messageId);
  } catch (error) {
    console.error('❌ SMTP Error:', error);
  }
}
main();
