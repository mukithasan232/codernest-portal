/**
 * Upstash Workflow Client Utility
 * File: src/lib/workflow.ts
 *
 * Provides a strongly-typed interface for triggering durable, multi-step
 * workflows such as client onboarding, 48-hour follow-up pipelines, and CRM outreach.
 */

import { Client } from '@upstash/workflow';
import { getAppBaseUrl } from '@/lib/qstash';

export interface TriggerOnboardingParams {
  leadId?: string;
  email: string;
  name: string;
  company?: string | null;
  serviceRequested?: string | null;
  source?: string | null;
  budget?: string | null;
}

const token = process.env.QSTASH_TOKEN;

export const isWorkflowConfigured = Boolean(
  token &&
  !token.includes('placeholder') &&
  !token.includes('example')
);

// Initialize Workflow Client
export const workflowClient = isWorkflowConfigured
  ? new Client({ token: token! })
  : null;

/**
 * Triggers the durable client onboarding workflow for a newly captured lead or prospect.
 */
export async function triggerOnboardingWorkflow(
  params: TriggerOnboardingParams
): Promise<{
  success: boolean;
  workflowRunId?: string;
  mock?: boolean;
  error?: string;
}> {
  const workflowUrl = `${getAppBaseUrl()}/api/workflows/onboarding`;

  if (workflowClient) {
    try {
      const response = await workflowClient.trigger({
        url: workflowUrl,
        body: params,
        retries: 3,
        flowControl: {
          key: 'onboarding-workflow',
          rate: 10,
          parallelism: 5,
        },
      });

      return {
        success: true,
        workflowRunId: response.workflowRunId,
      };
    } catch (err: unknown) {
      console.error('[Upstash Workflow] Error triggering onboarding workflow:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to trigger workflow',
      };
    }
  }

  // Graceful fallback for local development or when QSTASH_TOKEN is not yet set
  console.log('[Upstash Workflow] QSTASH_TOKEN not configured. Workflow trigger recorded in fallback mode:', params.email);
  return {
    success: true,
    mock: true,
  };
}
