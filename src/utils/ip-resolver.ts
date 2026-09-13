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
  domain: string | null;
  companyData: any | null;
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
      domain: null,
      companyData: null,
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
    // 1. Try IPInfo Enterprise if Token is available
    const ipinfoToken = process.env.IPINFO_TOKEN;
    if (ipinfoToken) {
      const res = await fetch(`https://ipinfo.io/${ip}?token=${ipinfoToken}`, {
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const data = await res.json();
        
        // IPInfo usually returns data.company if they have the company endpoint access
        // Example: data.company = { name: 'Google LLC', domain: 'google.com', type: 'business' }
        const isHosting = data.privacy?.hosting || false;
        const isIspProvider = data.company?.type === 'isp';
        
        // We consider it identified if type is 'business' and there is a domain
        const isBusiness = data.company?.type === 'business' || (data.company?.domain && !isIspProvider && !isHosting);
        
        const org = data.company?.name || data.org || null;
        const domain = data.company?.domain || null;
        
        if (isBusiness && org && domain && !isGenericOrInvalidCompany(org)) {
           return {
             companyName: org,
             domain: domain,
             companyData: data,
             isIdentified: true,
             ispName: null,
             isIsp: false,
             isCloudHosting: false,
             city: data.city || null,
             country: data.country || null,
             maskedIp: masked,
           };
        }
      }
    }

    // 2. Fallback to IP-API
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,city,isp,org,as,asname,reverse,mobile,proxy,hosting,query`,
      {
        signal: AbortSignal.timeout(2800)
      }
    );

    if (!res.ok) {
      throw new Error('IP-API response not ok');
    }

    const data = await res.json();
    if (data.status !== 'success') {
      throw new Error('IP-API returned fail status');
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

    if (isCloud) {
      return {
        companyName: null,
        domain: null,
        companyData: data,
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
        domain: null,
        companyData: data,
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
    let domainName = null;
    
    if (reverseHost && !isGenericReverseDns(reverseHost)) {
      const hostParts = reverseHost.split('.');
      if (hostParts.length >= 2) {
        domainName = hostParts.slice(-2).join('.');
        return {
          companyName: org && !isGenericOrInvalidCompany(org) ? org : domainName,
          domain: domainName,
          companyData: data,
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

    // Strict validation on org name
    if (org && !isGenericOrInvalidCompany(org)) {
      const corporateIndicators = ['inc', 'corp', 'corporation', 'llc', 'ltd', 'limited', 'gmbh', 'sa', 'ag', 'plc', 'co.'];
      const hasCorporateIndicator = corporateIndicators.some(ind =>
        new RegExp(`\\b${ind}\\b`, 'i').test(org)
      );

      if (hasCorporateIndicator) {
        return {
          companyName: org,
          domain: domainName,
          companyData: data,
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

    return {
      companyName: null,
      domain: null,
      companyData: data,
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
      domain: null,
      companyData: null,
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
