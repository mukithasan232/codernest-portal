// src/utils/ip-resolver.ts

export {
  CLOUD_HOSTING_PATTERNS,
  ISP_PATTERNS,
  INSTITUTION_PATTERNS,
  maskIp,
  formatLocation,
  formatVisitorFallback,
  isGenericOrInvalidCompany
} from './ip-helpers';

import {
  CLOUD_HOSTING_PATTERNS,
  ISP_PATTERNS,
  INSTITUTION_PATTERNS,
  maskIp,
  isGenericOrInvalidCompany
} from './ip-helpers';

export interface IpResolutionResult {
  companyName: string | null;
  isIdentified: boolean;
  ispName: string | null;
  isIsp: boolean;
  isCloudHosting: boolean;
  city: string | null;
  country: string | null;
  maskedIp: string;
}

/**
 * Checks if a reverse DNS hostname is a consumer/dynamic pool or corporate domain
 */
function isGenericReverseDns(hostname: string): boolean {
  const genericDnsKeywords = [
    'dynamic', 'pool', 'dhcp', 'res', 'broadband', 'cust', 'user', 'dial',
    'dsl', 'cable', 'static.carnival', 'link3.net', 'rego', 'btcl', 'telecom',
    'gci.net', 'comcast.net', 'verizon.net', 'att.net', 'spectrum.com'
  ];
  return genericDnsKeywords.some(kw => hostname.includes(kw));
}

/**
 * Resolves visitor IP with strict B2B corporate verification and ISP/Cloud filtering
 */
export async function resolveIpIdentity(ip: string): Promise<IpResolutionResult> {
  const masked = maskIp(ip);

  // Local/Internal IPs
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'Unknown' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return {
      companyName: null,
      isIdentified: false,
      ispName: null,
      isIsp: false,
      isCloudHosting: false,
      city: null,
      country: null,
      maskedIp: masked,
    };
  }

  try {
    // Fetch enriched data from ip-api with hosting, proxy, reverse, and ASN fields
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
      {
        signal: AbortSignal.timeout(2800)
      }
    );

    if (!res.ok) {
      return {
        companyName: null,
        isIdentified: false,
        ispName: null,
        isIsp: false,
        isCloudHosting: false,
        city: null,
        country: null,
        maskedIp: masked,
      };
    }

    const data = await res.json();
    if (data.status !== 'success') {
      return {
        companyName: null,
        isIdentified: false,
        ispName: null,
        isIsp: false,
        isCloudHosting: false,
        city: null,
        country: null,
        maskedIp: masked,
      };
    }

    const org = (data.org || '').trim();
    const isp = (data.isp || '').trim();
    const asname = (data.asname || '').trim();
    const isHosting = Boolean(data.hosting);
    const city = data.city || null;
    const country = data.country || null;

    // Check if cloud hosting / datacenter
    const isCloud = isHosting || CLOUD_HOSTING_PATTERNS.some(p =>
      org.toLowerCase().includes(p) || isp.toLowerCase().includes(p) || asname.toLowerCase().includes(p)
    );

    // Check if standard consumer/regional ISP
    const isIspProvider = ISP_PATTERNS.some(p =>
      org.toLowerCase().includes(p) || isp.toLowerCase().includes(p) || asname.toLowerCase().includes(p)
    );

    // Check if school or institution
    const isSchoolOrInst = INSTITUTION_PATTERNS.some(p =>
      org.toLowerCase().includes(p) || isp.toLowerCase().includes(p)
    );

    // If it's a Cloud provider or ISP, identify as such but NEVER as a corporate visitor company
    if (isCloud) {
      return {
        companyName: null,
        isIdentified: false,
        ispName: org || isp || 'Cloud Provider',
        isIsp: false,
        isCloudHosting: true,
        city,
        country,
        maskedIp: masked,
      };
    }

    if (isIspProvider || isSchoolOrInst) {
      return {
        companyName: null,
        isIdentified: false,
        ispName: isp || org || 'Internet Service Provider',
        isIsp: true,
        isCloudHosting: false,
        city,
        country,
        maskedIp: masked,
      };
    }

    // Check Reverse DNS from ip-api
    const reverseHost = (data.reverse || '').toLowerCase();

    // If reverse DNS exists and is a genuine corporate domain (not dynamic pool)
    if (reverseHost && !isGenericReverseDns(reverseHost)) {
      const hostParts = reverseHost.split('.');
      if (hostParts.length >= 2) {
        const domainName = hostParts.slice(-2).join('.');
        return {
          companyName: org && !isGenericOrInvalidCompany(org) ? org : domainName,
          isIdentified: true,
          ispName: isp,
          isIsp: false,
          isCloudHosting: false,
          city,
          country,
          maskedIp: masked,
        };
      }
    }

    // Strict validation on org name: must not match any filter and should have corporate indicator
    if (org && !isGenericOrInvalidCompany(org)) {
      const corporateIndicators = ['inc', 'corp', 'corporation', 'llc', 'ltd', 'limited', 'gmbh', 'sa', 'ag', 'plc', 'co.'];
      const hasCorporateIndicator = corporateIndicators.some(ind =>
        new RegExp(`\\b${ind}\\b`, 'i').test(org)
      );

      // Only accept if it has a corporate business marker or clean non-telecom organization
      if (hasCorporateIndicator) {
        return {
          companyName: org,
          isIdentified: true,
          ispName: isp,
          isIsp: false,
          isCloudHosting: false,
          city,
          country,
          maskedIp: masked,
        };
      }
    }

    // Default: Fallback as Anonymous Visitor
    return {
      companyName: null,
      isIdentified: false,
      ispName: isp || org || null,
      isIsp: isIspProvider,
      isCloudHosting: false,
      city,
      country,
      maskedIp: masked,
    };
  } catch (error) {
    console.error(`[IP Resolver] Error resolving ${ip}:`, error);
    return {
      companyName: null,
      isIdentified: false,
      ispName: null,
      isIsp: false,
      isCloudHosting: false,
      city: null,
      country: null,
      maskedIp: masked,
    };
  }
}
