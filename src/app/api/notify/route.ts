import { NextResponse } from 'next/server';
import { sendOfficialNotification } from '@/lib/email';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  try {
    // 1. Basic Security: Check for a shared secret or API key (optional but recommended for webhooks)
    const headersList = await headers();
    const apiKey = headersList.get('x-api-key') || headersList.get('authorization');
    
    // For a production webhook, you'd compare this against process.env.WEBHOOK_SECRET
    // If you don't use auth yet, you can bypass this, but it's best practice.
    if (process.env.WEBHOOK_SECRET && apiKey !== `Bearer ${process.env.WEBHOOK_SECRET}` && apiKey !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse Incoming Payload
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload' }, { status: 400 });
    }

    const { subject, title, message, data, to } = body;

    if (!title || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title and message are required.' },
        { status: 400 }
      );
    }

    // 3. Trigger Official Email Notification
    const emailResult = await sendOfficialNotification({
      to: to, // If not provided, it falls back to the system's primary email in sendOfficialNotification
      subject: subject || `System Notification: ${title}`,
      title: title,
      message: message,
      dataSummary: data, // Expected to be an object (e.g. { Name: "John", Action: "Created Post" })
    });

    if (!emailResult.success) {
      // Return 500 if the email fails, but you might want to log it and return 200 depending on webhook requirements
      return NextResponse.json(
        { success: false, error: 'Failed to send notification email', details: emailResult.error },
        { status: 500 }
      );
    }

    // 4. Return Success Response
    return NextResponse.json(
      { success: true, message: 'Notification processed and email dispatched successfully.' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('API Notify Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
