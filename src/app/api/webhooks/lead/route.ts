import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db/mongodb';
import Lead from '@/lib/models/Lead';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { name, email, phone, service_type } = body;

    if (!name || !email || !service_type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (name, email, service_type)' },
        { status: 400 }
      );
    }

    // Check if lead already exists to prevent duplicates
    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return NextResponse.json(
        { success: false, message: 'Lead with this email already exists', data: existingLead },
        { status: 200 }
      );
    }

    // Create the new lead
    const newLead = await Lead.create({
      name,
      email,
      phone,
      service_type,
      status: 'pending',
    });

    // --- NEW: Sync with n8n Webhook ---
    try {
      const globalSettings = await prisma.systemSettings.findUnique({
        where: { id: 'global_settings' },
      });

      if (globalSettings?.n8nWebhookUrl) {
        // Fire and forget (do not await, or if awaiting, swallow errors)
        fetch(globalSettings.n8nWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event: 'new_lead',
            lead: newLead,
          }),
        }).catch((err) => {
          console.error('Failed to sync lead with n8n webhook:', err);
        });
      }
    } catch (syncError) {
      console.error('Error fetching SystemSettings or triggering n8n:', syncError);
      // We don't fail the request here, lead is already saved
    }

    return NextResponse.json(
      { success: true, message: 'Lead created successfully', data: newLead },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error processing lead webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
