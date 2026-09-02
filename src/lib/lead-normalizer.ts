export interface RawLeadData {
  name?: string;
  email?: string;
  source?: string;
  requirements?: string;
  budget?: string;
  [key: string]: any;
}

export interface NormalizedLeadData {
  name: string;
  email: string;
  source: string;
  requirements: string;
  budget: string;
}

export class LeadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LeadValidationError';
  }
}

export function normalizeLeadData(data: RawLeadData): NormalizedLeadData {
  // Normalize and capitalize Name
  let name = (data.name || '').trim();
  if (name) {
    name = name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } else {
    name = 'Unknown Lead';
  }

  // Validate Email via Regex
  const email = (data.email || '').trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    throw new LeadValidationError(`Invalid email format provided: ${email}`);
  }

  // Determine Source (Platform identifier)
  let source = (data.source || '').trim();
  const validSources = ['Legiit', 'Fiverr', 'Upwork', 'LinkedIn', 'Manual', 'Website'];
  const matchedSource = validSources.find(s => s.toLowerCase() === source.toLowerCase());
  source = matchedSource || (source ? source : 'Unknown Platform');

  // Extract Requirements & Budget
  const requirements = (data.requirements || data.project_brief || data.notes || '').trim() || 'No specific requirements provided.';
  const budget = (data.budget || '').trim();

  return {
    name,
    email,
    source,
    requirements,
    budget,
  };
}
