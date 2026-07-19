import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'EDITOR')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { host, port, user, pass, testEmailTo } = body;

    if (!host || !port || !user || !pass || !testEmailTo) {
      return NextResponse.json({ success: false, error: 'Missing required SMTP credentials or recipient email.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #3b82f6;">SMTP Test Successful 🎉</h2>
        <p>Hello!</p>
        <p>This is a test email sent from your CoderNest Admin Dashboard.</p>
        <p>If you are receiving this, your SMTP configuration is working correctly.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">This message was generated automatically. Please do not reply.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"CoderNest System" <${user}>`,
      to: testEmailTo,
      subject: 'SMTP Connection Test - CoderNest',
      html: htmlContent,
    });

    return NextResponse.json({ success: true, message: 'Test email sent successfully!' });
  } catch (error: any) {
    console.error('Test Email Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send test email.' }, { status: 500 });
  }
}
