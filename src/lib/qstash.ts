/**
 * Upstash QStash Client & Background Email Queue Utility
 *
 * Provides resilient serverless message queuing, signature verification,
 * and bulk email job fan-out for CoderNest Portal.
 *
 * NOTE: Ensure the following environment variables are added to .env:
 * - QSTASH_TOKEN
 * - QSTASH_CURRENT_SIGNING_KEY
 * - QSTASH_NEXT_SIGNING_KEY (optional, for key rotation)
 * - QSTASH_NEXT_URL (optional override for local tunnels / ngrok)
 */

import { Client, Receiver } from '@upstash/qstash';
import type { NextRequest } from 'next/server';

export interface EmailAttachmentPayload {
  filename: string;
  content: string; // Base64 encoded file content
  contentType?: string;
}

export interface EmailJobPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  leadId?: string | null;
  campaignId?: string | null;
  clientName?: string | null;
  companyName?: string | null;
  type?: 'campaign' | 'onboarding' | 'system';
  attachments?: EmailAttachmentPayload[];
}

const token = process.env.QSTASH_TOKEN;
const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;

export const isQStashConfigured = Boolean(
  token &&
  !token.includes('placeholder') &&
  !token.includes('example')
);

// Initialize Upstash QStash Client
export const qstashClient = isQStashConfigured
  ? new Client({ token: token! })
  : null;

// Initialize Upstash QStash Receiver for cryptographic signature verification
export const qstashReceiver = currentSigningKey
  ? new Receiver({
      currentSigningKey,
      nextSigningKey: nextSigningKey || currentSigningKey,
    })
  : null;

/**
 * Resolves the destination webhook base URL for worker endpoints
 */
export function getAppBaseUrl(): string {
  if (process.env.QSTASH_NEXT_URL) {
    return process.env.QSTASH_NEXT_URL.replace(/\/$/, '');
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  return 'https://codernest.agency';
}

/**
 * Enqueues a single email job to the QStash background worker
 */
export async function enqueueEmail(
  job: EmailJobPayload,
  options?: { delaySeconds?: number; retries?: number }
): Promise<{ success: boolean; messageId?: string; queuedLocally?: boolean; error?: string }> {
  const workerUrl = `${getAppBaseUrl()}/api/qstash/send-email`;

  if (qstashClient) {
    try {
      const res = await qstashClient.publishJSON({
        url: workerUrl,
        body: job,
        delay: options?.delaySeconds,
        retries: options?.retries ?? 3,
      });

      return { success: true, messageId: res.messageId };
    } catch (err: unknown) {
      console.error('[QStash] Failed to enqueue message:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to enqueue to QStash',
      };
    }
  }

  // Local fallback: If QSTASH_TOKEN is not yet configured, trigger worker asynchronously via direct fetch
  console.warn('[QStash] QSTASH_TOKEN not configured. Dispatching email job via local async fallback.');
  try {
    const localUrl = `http://localhost:${process.env.PORT || 3000}/api/qstash/send-email`;
    fetch(localUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-local-fallback': 'true' },
      body: JSON.stringify(job),
    }).catch(err => console.error('[QStash Local Fallback] Worker error:', err));

    return { success: true, queuedLocally: true };
  } catch (err) {
    return { success: false, error: 'Local async fallback failed' };
  }
}

/**
 * Enqueues a batch of email jobs in parallel using QStash batching
 */
export async function enqueueBulkEmails(
  jobs: EmailJobPayload[],
  options?: { delayStepSeconds?: number }
): Promise<{ total: number; queued: number; failed: number }> {
  const workerUrl = `${getAppBaseUrl()}/api/qstash/send-email`;
  let queued = 0;
  let failed = 0;

  if (qstashClient && jobs.length > 0) {
    try {
      // Use batchJSON for optimal throughput without hitting rate boundaries
      const batchPayloads = jobs.map((job, idx) => ({
        url: workerUrl,
        body: job,
        delay: options?.delayStepSeconds ? idx * options.delayStepSeconds : undefined,
        retries: 3,
      }));

      // Split into chunks of 100 if batch size exceeds QStash max limits
      const chunkSize = 100;
      for (let i = 0; i < batchPayloads.length; i += chunkSize) {
        const chunk = batchPayloads.slice(i, i + chunkSize);
        await qstashClient.batchJSON(chunk);
        queued += chunk.length;
      }

      return { total: jobs.length, queued, failed: 0 };
    } catch (err) {
      console.error('[QStash Batch] Error enqueueing batch:', err);
      // Fallback to sequential individual enqueueing
    }
  }

  // Sequential enqueue fallback
  for (const job of jobs) {
    const result = await enqueueEmail(job);
    if (result.success) {
      queued++;
    } else {
      failed++;
    }
  }

  return { total: jobs.length, queued, failed };
}

/**
 * Validates the inbound cryptographic signature from QStash
 */
export async function verifyQStashSignature(
  req: NextRequest,
  rawBody: string
): Promise<{ isValid: boolean; error?: string }> {
  // Allow local development fallback when running without QStash keys
  if (!qstashReceiver) {
    const isLocalFallback = req.headers.get('x-local-fallback') === 'true';
    const isDev = process.env.NODE_ENV !== 'production';
    if (isLocalFallback || isDev) {
      return { isValid: true };
    }
  }

  const signature = req.headers.get('upstash-signature');
  if (!signature) {
    return { isValid: false, error: 'Missing Upstash-Signature header' };
  }

  if (!qstashReceiver) {
    return { isValid: false, error: 'QStash Receiver is not configured on server' };
  }

  try {
    const isValid = await qstashReceiver.verify({
      signature,
      body: rawBody,
      url: req.url,
    });

    return { isValid };
  } catch (err) {
    return {
      isValid: false,
      error: err instanceof Error ? err.message : 'Invalid QStash signature',
    };
  }
}
