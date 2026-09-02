'use server';

import fs from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { fetchLegiitLeads } from '@/services/legiit.service';
import { fetchUpworkJobs } from '@/services/upwork.service';

const KEYS_FILE_PATH = path.join(process.cwd(), 'data', 'api-keys.json');

export interface ApiKeys {
  upworkApiKey: string;
  upworkAccessToken?: string;
  upworkRefreshToken?: string;
  upworkTokenExpiry?: number; // UNIX timestamp
  legiitApiKey: string;
  fiverrWebhookUrl: string;
}

// 1. Get API Keys
export async function getApiKeys(): Promise<ApiKeys> {
  try {
    const data = await fs.readFile(KEYS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty strings
    return { upworkApiKey: '', legiitApiKey: '', fiverrWebhookUrl: '' };
  }
}

// 2. Save API Keys
export async function saveApiKeys(keys: ApiKeys) {
  try {
    // Ensure directory exists
    const dir = path.dirname(KEYS_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(KEYS_FILE_PATH, JSON.stringify(keys, null, 2), 'utf-8');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save API keys:', error);
    return { success: false, error: error.message };
  }
}

export interface JobListing {
  id: string;
  title: string;
  clientName: string;
  source: string;
  budget: string;
  postedTime: string;
  matchScore: number;
  description: string;
  url?: string;
}

// 3. Fetch/Simulate Matching Jobs
export async function fetchMatchingJobs(): Promise<{ success: boolean; jobs?: JobListing[]; error?: string; status?: { legiit: boolean; upwork: boolean; upworkError?: string } }> {
  try {
    // Check if we have keys (simulate API check)
    const keys = await getApiKeys();
    
    // Check ENV variables as well
    const envLegiitKey = process.env.LEGIIT_API_TOKEN;
    const finalLegiitKey = keys.legiitApiKey || envLegiitKey;
    
    const isConfigured = keys.upworkApiKey || finalLegiitKey || keys.fiverrWebhookUrl;

    if (!isConfigured) {
      return { success: false, error: 'No API keys configured. Please configure integrations first.' };
    }

    let allJobs: JobListing[] = [];

    // 1. Fetch REAL Legiit Leads if key is available
    let legiitStatus = false;
    if (finalLegiitKey) {
      const legiitJobs = await fetchLegiitLeads(finalLegiitKey);
      if (legiitJobs.length > 0) {
        allJobs = [...allJobs, ...legiitJobs];
      }
      legiitStatus = true; // Key exists, status is active
    }

    // 2. Fetch REAL Upwork Jobs if tokens exist
    let upworkStatus = false;
    let upworkErrorMsg = undefined;
    
    if (keys.upworkAccessToken) {
      const upworkRes = await fetchUpworkJobs(['nextjs', 'react', 'prisma', 'tailwind']);
      
      if (upworkRes.success && upworkRes.jobs) {
        allJobs = [...allJobs, ...upworkRes.jobs];
        upworkStatus = true;
      } else if (upworkRes.status === 403) {
        // Pending review or disabled
        upworkStatus = false;
        upworkErrorMsg = upworkRes.error;
      } else {
        upworkStatus = false;
        upworkErrorMsg = upworkRes.error || 'Failed to connect to Upwork API.';
      }
    } else if (keys.upworkApiKey) {
      // API Key exists but not connected via OAuth
      upworkErrorMsg = 'Upwork API Key found, but not connected via OAuth. Please go to API Settings and connect.';
    }

    if (keys.fiverrWebhookUrl) {
      allJobs.push({
        id: `fiv-${Date.now()}-3`,
        title: 'Custom Admin Dashboard with Analytics',
        clientName: 'E-commerce Brand',
        source: 'Fiverr',
        budget: '$2,500',
        postedTime: '3 hours ago',
        matchScore: 92,
        description: 'Looking to build a custom admin panel to track our KPIs. Prefer Next.js App Router.'
      });
    }
    
    return { 
      success: true, 
      jobs: allJobs,
      status: { 
        legiit: legiitStatus,
        upwork: upworkStatus,
        upworkError: upworkErrorMsg
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. Convert Job to CRM Lead
export async function convertJobToLead(job: JobListing) {
  try {
    // Generate a mock email for the client based on their name to simulate contact info extraction
    const mockEmail = `${job.clientName.replace(/\s+/g, '.').toLowerCase().replace(/[^a-z0-9.]/g, '')}@example.com`;
    
    // Check if lead already exists
    const existing = await prisma.lead.findFirst({
      where: { email: mockEmail }
    });

    if (existing) {
      return { success: false, error: 'Lead already exists in CRM.' };
    }

    const newLead = await prisma.lead.create({
      data: {
        name: job.clientName.split(' (')[0], // Remove (via Upwork) if present
        email: mockEmail,
        source: `Job Hunter (${job.source})`,
        message: `Job Title: ${job.title}\nBudget: ${job.budget}\nMatch Score: ${job.matchScore}%\n\nDescription:\n${job.description}`,
        status: 'new'
      }
    });

    return { success: true, lead: newLead };
  } catch (error: any) {
    console.error('Convert Job Error:', error);
    return { success: false, error: error.message || 'Failed to convert job to lead.' };
  }
}
