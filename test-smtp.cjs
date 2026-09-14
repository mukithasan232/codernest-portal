const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env' });

async function testSMTP() {
  console.log('Testing SMTP with:');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('Pass:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: parseInt(process.env.SMTP_PORT || '465') === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    const success = await transporter.verify();
    console.log('✅ SMTP Connection Successful!');
  } catch (error) {
    console.error('❌ SMTP Connection Failed:', error.message);
  }
}

testSMTP();
