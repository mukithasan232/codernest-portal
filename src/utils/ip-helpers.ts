// src/utils/ip-helpers.ts

// ─── CLOUD HOSTING & DATACENTER BLOCKLIST ─────────────────────────────────────────
export const CLOUD_HOSTING_PATTERNS = [
  'microsoft', 'azure', 'msn-as', 'aws', 'amazon', 'amazon.com', 'amazon data services',
  'google cloud', 'gcp', 'google-cloud', 'google llc', 'digitalocean', 'hetzner',
  'linode', 'ovh', 'cloudflare', 'fastly', 'akamai', 'oracle cloud', 'oracle-cloud',
  'alibaba', 'alicloud', 'tencent', 'vultr', 'hostinger', 'contabo', 'namecheap',
  'godaddy', 'rackspace', 'leaseweb', 'choopa', 'datapacket', 'servers.com',
  'scaleway', 'equinix', 'cogent', 'hurricane electric', 'he.net', 'softlayer',
  'liquid web', 'ionos', '1&1', 'zenlayer', 'ucloud', 'huawei cloud', 'kamatera',
  'bluehost', 'dreamhost', 'inmotion', 'siteground', 'hostgator', 'a2 hosting'
];

// ─── CONSUMER / RESIDENTIAL & REGIONAL ISP BLOCKLIST ─────────────────────────────
export const ISP_PATTERNS = [
  // Generic ISP / Telecom words
  'isp', 'internet service provider', 'broadband', 'telecom', 'telecommunication',
  'telecommunications', 'cable', 'fiber', 'fibre', 'wireless', 'mobile', 'cellular',
  'asn', 'network', 'communications', 'dynamic', 'residential', 'dialup', 'dsl',
  'fiberoptics', 'net', 'ip-pool', 'dhcp', 'transit', 'gateway', 'backbone',
  'router', 'switch', 'apnic', 'ripe', 'arin', 'lacnic', 'afrinic', 'subnet', 'pool',

  // Bangladesh & South Asia ISPs
  'btcl', 'bangladesh telecommunication', 'summit communication', 'summit communications',
  'link3', 'carnival', 'amber it', 'amberit', 'dot internet', 'grameenphone',
  'banglalink', 'robi', 'teletalk', 'earthnet', 'triangle', 'mazeda',
  'icc communication', 'colobd', 'excell', 'antaranga', 'circle network',
  'dhaka colo', 'fiber@home', 'bracnet', 'agni systems', 'agni', 'bdcom',
  'novocom', 'mango teleservices', 'rego communications', 'level3', 'level 3',
  'dhaka fiber', 'chittagong online', 'dhaka internet', 'bttb',

  // Global Consumer & Regional ISPs
  'comcast', 'verizon', 'spectrum', 'att', 'at&t', 't-mobile', 'tmobile',
  'cox', 'centurylink', 'charter', 'xfinity', 'optimum', 'suddenlink',
  'frontier', 'windstream', 'mediacom', 'google fiber', 'starlink', 'hughesnet',
  'bt', 'british telecommunications', 'virgin media', 'sky broadband', 'sky uk',
  'talktalk', 'bell canada', 'bell', 'rogers', 'telus', 'shaw', 'videotron',
  'telstra', 'optus', 'tpg', 'iinet', 'vodafone', 'orange', 'telefonica',
  'deutsche telekom', 'telekom', 'swisscom', 'kpn', 'proximus', 'tim', 'free sas',
  'bouygues', 'sfr', 'airtel', 'bharti airtel', 'reliance jio', 'jio',
  'tata teleservices', 'bsnl', 'mtnl', 'vocus', 'plusnet', 'talkmobile', 'ee', 'o2', 'three'
];

// ─── SCHOOLS, COLLEGES, & PUBLIC INSTITUTION BLOCKLIST ───────────────────────────
export const INSTITUTION_PATTERNS = [
  'school', 'high school', 'primary school', 'grammar school', 'vidyalaya',
  'madrasah', 'madrasha', 'maktab', 'college', 'university', 'campus',
  'academy', 'shiksha', 'education', 'faculty', 'institute of technology',
  'board of intermediate', 'polytechnic', 'govt', 'government', 'ministry',
  'directorate', 'department of', 'public library', 'hospital', 'clinic'
];

/**
 * Mask an IP address for privacy & dashboard display (e.g. 103.139.xxx.xx)
 */
export function maskIp(ip?: string | null): string {
  if (!ip || ip === 'Unknown') return 'Unknown IP';
  if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';

  // IPv4 masking
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xx`;
    }
  }

  // IPv6 masking
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts.slice(0, 2).join(':')}:xxxx::`;
  }

  return ip;
}

/**
 * Clean & decode URI encoded location strings (e.g. "San%20Juan, AR" -> "San Juan, AR")
 */
export function formatLocation(location?: string | null): string {
  if (!location || location === 'Unknown' || location === 'Unknown Region' || location === 'Unknown Country') {
    return 'Unknown Location';
  }
  try {
    return decodeURIComponent(location);
  } catch {
    return location;
  }
}

/**
 * Formats a clean fallback name when no corporate identity is verified
 * e.g. "Visitor from Naogaon, BD" or "Visitor from California, US"
 */
export function formatVisitorFallback(location?: string | null, ip?: string | null): string {
  const cleanLoc = formatLocation(location);
  if (cleanLoc && cleanLoc !== 'Unknown Location') {
    return `Visitor from ${cleanLoc}`;
  }
  const masked = maskIp(ip);
  if (masked && masked !== 'Unknown IP') {
    return `Visitor (${masked})`;
  }
  return 'Anonymous Visitor';
}

/**
 * Validates if a string is a generic ISP, cloud datacenter, or school entity
 * Returns TRUE if it SHOULD BE REJECTED from being a Company Name.
 */
export function isGenericOrInvalidCompany(name?: string | null): boolean {
  if (!name || typeof name !== 'string') return true;
  const lower = name.trim().toLowerCase();

  if (lower.length < 3) return true;

  // Cloud hosting check
  if (CLOUD_HOSTING_PATTERNS.some(p => lower.includes(p))) {
    return true;
  }

  // ISP check
  if (ISP_PATTERNS.some(p => lower.includes(p))) {
    return true;
  }

  // School/Institution check
  if (INSTITUTION_PATTERNS.some(p => lower.includes(p))) {
    return true;
  }

  return false;
}
