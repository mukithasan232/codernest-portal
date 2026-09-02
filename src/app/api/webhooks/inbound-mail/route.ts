import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    let sender = '';
    let subject = '';
    let text = '';

    // Handle both JSON and FormData (SendGrid/Mailgun Inbound Parse format)
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const body = await req.json();
      sender = body.sender || body.from || '';
      subject = body.subject || '';
      text = body.text || body.body || '';
    } else if (contentType.includes('multipart/form-data') || contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      sender = (formData.get('from') as string) || (formData.get('sender') as string) || '';
      subject = (formData.get('subject') as string) || '';
      text = (formData.get('text') as string) || (formData.get('body-plain') as string) || '';
    } else {
      return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
    }

    if (!sender) {
      return NextResponse.json({ error: 'No sender email found' }, { status: 400 });
    }

    // Extract email from formats like "John Doe <john@example.com>"
    const emailMatch = sender.match(/<([^>]+)>/);
    const cleanEmail = emailMatch ? emailMatch[1].toLowerCase() : sender.toLowerCase().trim();

    // Find the lead in the CRM
    const lead = await prisma.lead.findFirst({
      where: { email: cleanEmail }
    });

    if (!lead) {
      // If we don't know this email, just log and return 200 to acknowledge receipt
      console.log(`[Inbound Mail] Ignored email from unknown lead: ${cleanEmail}`);
      return NextResponse.json({ success: true, message: 'Ignored (Unknown lead)' }, { status: 200 });
    }

    // Generate a snippet from the email body (first 100 characters)
    const snippet = text.trim().substring(0, 100).replace(/\n/g, ' ') + (text.length > 100 ? '...' : '');

    // Append to existing message/notes
    const dateStr = new Date().toLocaleString();
    const newNote = `[${dateStr}] Replied to email campaign: ${snippet}`;
    const updatedMessage = lead.message ? `${lead.message}\n\n${newNote}` : newNote;

    // Automatically update status if they were just "new" or "contacted"
    let newStatus = lead.status;
    if (lead.status === 'new' || lead.status === 'contacted') {
      newStatus = 'proposal'; // Move to PROPOSAL_SENT (or flagged as replied via hasNewReply)
    }

    // Update the lead with the new reply flag
    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        status: newStatus,
        hasNewReply: true,
        lastReplySnippet: snippet,
        message: updatedMessage,
      }
    });

    console.log(`[Inbound Mail] Processed reply from ${cleanEmail}`);

    return NextResponse.json({ success: true, message: 'Lead updated with reply' }, { status: 200 });
  } catch (error: any) {
    console.error('[/api/webhooks/inbound-mail] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
