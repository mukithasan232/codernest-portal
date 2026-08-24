/**
 * Headless n8n REST API Utility
 * 
 * Interacts directly with the n8n REST API to fetch, toggle, and trigger workflows.
 * Requires N8N_API_URL and N8N_API_KEY environment variables.
 */

const N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678/api/v1';
const N8N_API_KEY = process.env.N8N_API_KEY;

/**
 * Helper to construct the API headers
 */
const getHeaders = () => {
  if (!N8N_API_KEY) {
    throw new Error('N8N_API_KEY is not configured in environment variables.');
  }
  return {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': N8N_API_KEY,
  };
};

/**
 * Fetches all workflows from n8n
 */
export async function fetchWorkflows() {
  try {
    const res = await fetch(`${N8N_API_URL}/workflows`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch workflows: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data; // n8n returns workflows inside a "data" array
  } catch (error) {
    console.error('Error fetching n8n workflows:', error);
    throw error;
  }
}

/**
 * Fetches a specific workflow by ID
 */
export async function fetchWorkflow(id: string) {
  try {
    const res = await fetch(`${N8N_API_URL}/workflows/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch workflow ${id}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error fetching n8n workflow ${id}:`, error);
    throw error;
  }
}

/**
 * Activates or Deactivates a workflow
 */
export async function toggleWorkflow(id: string, activate: boolean) {
  try {
    const endpoint = activate ? 'activate' : 'deactivate';
    const res = await fetch(`${N8N_API_URL}/workflows/${id}/${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Failed to ${endpoint} workflow ${id}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error toggling n8n workflow ${id}:`, error);
    throw error;
  }
}

/**
 * Triggers an n8n webhook workflow directly with JSON data
 * Note: This triggers the webhook URL, NOT the REST API.
 */
export async function triggerWebhook(webhookUrl: string, payload: any) {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to trigger webhook: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error triggering n8n webhook:', error);
    throw error;
  }
}

/**
 * Executes a specific workflow via the n8n REST API
 */
export async function executeWorkflow(id: string, payload?: any) {
  try {
    const res = await fetch(`${N8N_API_URL}/workflows/${id}/execute`, {
      method: 'POST',
      headers: getHeaders(),
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!res.ok) {
      throw new Error(`Failed to execute workflow ${id}: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error(`Error executing n8n workflow ${id}:`, error);
    throw error;
  }
}
