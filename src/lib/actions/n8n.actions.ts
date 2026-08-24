'use server';

import { fetchWorkflows, toggleWorkflow, triggerWebhook, executeWorkflow } from '@/lib/services/n8n.service';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to get all workflows
 */
export async function getAutomationWorkflows() {
  try {
    const workflows = await fetchWorkflows();
    return { success: true, data: workflows };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

/**
 * Server Action to toggle a workflow's active state
 */
export async function setWorkflowState(id: string, activate: boolean) {
  try {
    await toggleWorkflow(id, activate);
    revalidatePath('/admin/automation');
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

/**
 * Server Action to manually trigger an n8n webhook
 */
export async function runManualTrigger(webhookUrl: string, payload: any) {
  try {
    const result = await triggerWebhook(webhookUrl, payload);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}

/**
 * Server Action to manually execute a workflow via n8n REST API
 */
export async function executeAutomationWorkflow(workflowId: string, payload?: any) {
  try {
    const result = await executeWorkflow(workflowId, payload);
    return { success: true, data: result };
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred" };
  }
}
