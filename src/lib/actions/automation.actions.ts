'use server';

import connectToDatabase from '@/lib/db/mongodb';
import CampaignSettings, { ICampaignSettings } from '@/lib/models/CampaignSettings';
import Lead, { ILead } from '@/lib/models/Lead';
import { revalidatePath } from 'next/cache';

export async function getCampaignSettings() {
  try {
    await connectToDatabase();
    let settings = await CampaignSettings.findOne();
    if (!settings) {
      settings = await CampaignSettings.create({
        daily_email_limit: 50,
        emails_sent_today: 0,
        last_reset_date: new Date(),
      });
    }
    return { success: true, data: JSON.parse(JSON.stringify(settings)) };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function updateCampaignSettings(data: Partial<ICampaignSettings>) {
  try {
    await connectToDatabase();
    let settings = await CampaignSettings.findOne();
    if (!settings) {
      settings = new CampaignSettings(data);
    } else {
      Object.assign(settings, data);
    }
    await settings.save();
    revalidatePath('/admin/automation');
    return { success: true, data: JSON.parse(JSON.stringify(settings)) };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function getAutomationLeads() {
  try {
    await connectToDatabase();
    const leads = await Lead.find().sort({ createdAt: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(leads)) };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

export async function updateAutomationLeadStatus(id: string, status: string) {
  try {
    await connectToDatabase();
    await Lead.findByIdAndUpdate(id, { status });
    revalidatePath('/admin/automation');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
