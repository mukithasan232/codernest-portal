import { JobListing } from '@/actions/job-hunter.actions';

export async function fetchLegiitLeads(apiKey: string): Promise<JobListing[]> {
  try {
    // In a real production scenario, this endpoint would point to the actual Legiit API
    // We are simulating the API call structure here, but using the real provided token.
    const LEGIIT_API_URL = process.env.LEGIIT_API_URL || 'https://api.legiit.com/v1/buyer-requests';
    
    // As we don't have the exact API documentation, we wrap this in a safe try-catch
    // that handles both successful real responses and timeouts/404s cleanly.
    const response = await fetch(LEGIIT_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      // 5 second timeout to prevent hanging the dashboard if the API is slow
      signal: AbortSignal.timeout(5000), 
    });

    if (!response.ok) {
      console.warn(`[Legiit API] Returned ${response.status}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    const leads = data.data || data.leads || data.requests || [];

    // Map incoming fields to JobListing
    return leads.map((lead: any) => ({
      id: `leg-${lead.id || Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: lead.title || lead.project_title || 'Untitled Project',
      clientName: lead.client_name || lead.username || 'Legiit Client',
      source: 'Legiit',
      budget: lead.budget ? `$${lead.budget}` : 'TBD',
      postedTime: lead.created_at ? new Date(lead.created_at).toLocaleDateString() : 'Recently',
      matchScore: calculateMockMatchScore(lead.description || lead.title || ''),
      description: lead.description || lead.requirements || 'No specific description provided.',
    }));

  } catch (error) {
    console.error('[Legiit API Fetch Error]:', error);
    // Return empty array to gracefully fallback
    return [];
  }
}

// Simple utility to generate a match score based on relevant tech keywords
function calculateMockMatchScore(text: string): number {
  const keywords = ['react', 'next.js', 'node', 'web', 'app', 'full-stack', 'developer', 'saas'];
  const lowerText = text.toLowerCase();
  
  let score = 50; // base score
  for (const keyword of keywords) {
    if (lowerText.includes(keyword)) {
      score += 10;
    }
  }
  
  return Math.min(score, 99); // max score 99
}
