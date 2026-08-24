import cron from 'node-cron';
import dotenv from 'dotenv';
import path from 'path';
import connectToDatabase from '../src/lib/db/mongodb';
import { processPendingEmails } from '../src/lib/services/email.service';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('Starting Email Worker...');

const startWorker = async () => {
  try {
    await connectToDatabase();
    console.log('Worker connected to MongoDB');

    // Run the email processor every 5 minutes
    // You can adjust the cron expression as needed
    cron.schedule('*/5 * * * *', async () => {
      console.log(`[${new Date().toISOString()}] Running email processing job...`);
      await processPendingEmails();
    });

    console.log('Email processing cron job scheduled (Runs every 5 minutes)');
  } catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
  }
};

startWorker();
