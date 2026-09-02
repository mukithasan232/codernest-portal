export const BLOCKED_DOMAINS = [
  'example.com',
  'test.com',
  'domain.com',
  'placeholder.com'
];

/**
 * Validates if an email is a dummy/test email.
 * Blocks specific domains and emails containing 'sample' or 'no-reply'.
 */
export function isDummyEmail(email: string): boolean {
  if (!email) return true;
  
  const lowerEmail = email.toLowerCase().trim();
  
  if (lowerEmail.includes('sample') || lowerEmail.includes('no-reply')) {
    return true;
  }

  const parts = lowerEmail.split('@');
  if (parts.length !== 2) return true;

  const domain = parts[1];
  
  if (BLOCKED_DOMAINS.includes(domain)) {
    return true;
  }

  return false;
}
