import nodemailer from 'nodemailer';
import CampaignSettings from '../models/CampaignSettings';
import Lead from '../models/Lead';

/**
 * Creates a reusable transporter object using SMTP transport
 * Retrieves dynamic settings from DB or falls back to ENV variables
 */
const getTransporter = async () => {
  // Get settings from DB
  const settings = await CampaignSettings.findOne();
  
  const host = settings?.smtp_host || process.env.SMTP_HOST;
  const port = settings?.smtp_port || parseInt(process.env.SMTP_PORT || '587');
  const user = settings?.smtp_user || process.env.SMTP_USER;
  const pass = settings?.smtp_pass || process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP credentials are not fully configured.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Processes pending leads and sends emails based on daily limits
 */
export const processPendingEmails = async () => {
  try {
    let settings = await CampaignSettings.findOne();
    if (!settings) {
      // Create default settings if not exists
      settings = await CampaignSettings.create({
        daily_email_limit: 50,
        emails_sent_today: 0,
        last_reset_date: new Date(),
      });
    }

    // Check if we need to reset the daily counter (if it's a new day)
    const now = new Date();
    const lastReset = new Date(settings.last_reset_date);
    const isNewDay = 
      now.getFullYear() > lastReset.getFullYear() ||
      now.getMonth() > lastReset.getMonth() ||
      now.getDate() > lastReset.getDate();

    if (isNewDay) {
      settings.emails_sent_today = 0;
      settings.last_reset_date = now;
      await settings.save();
    }

    // Check if daily limit is reached
    const remainingEmails = settings.daily_email_limit - settings.emails_sent_today;
    
    if (remainingEmails <= 0) {
      console.log('Daily email limit reached. Skipping email processing.');
      return;
    }

    // Fetch pending leads up to the remaining limit
    const pendingLeads = await Lead.find({ status: 'pending' }).limit(remainingEmails);

    if (pendingLeads.length === 0) {
      console.log('No pending leads to email.');
      return;
    }

    const transporter = await getTransporter();

    let sentCount = 0;

    for (const lead of pendingLeads) {
      try {
        // Send email
        await transporter.sendMail({
          from: `"CoderNest" <${settings.smtp_user || process.env.SMTP_USER}>`,
          to: lead.email,
          subject: 'Welcome to CoderNest!',
          text: `Hi ${lead.name},\n\nThank you for your interest in our ${lead.service_type} services. How can we help you today?\n\nBest,\nThe CoderNest Team`,
          html: `<p>Hi ${lead.name},</p><p>Thank you for your interest in our <strong>${lead.service_type}</strong> services. How can we help you today?</p><br/><p>Best,<br/>The CoderNest Team</p>`,
        });

        // Update lead status
        lead.status = 'emailed';
        await lead.save();

        sentCount++;
        console.log(`Email sent to ${lead.email}`);
      } catch (err) {
        console.error(`Failed to send email to ${lead.email}:`, err);
        lead.status = 'failed';
        await lead.save();
      }
    }

    // Update settings counter
    if (sentCount > 0) {
      settings.emails_sent_today += sentCount;
      await settings.save();
      console.log(`Successfully sent ${sentCount} emails.`);
    }

  } catch (error) {
    console.error('Error in processPendingEmails:', error);
  }
};
