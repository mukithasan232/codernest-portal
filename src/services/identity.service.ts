// src/services/identity.service.ts

import { resolveIpIdentity, isGenericOrInvalidCompany, maskIp, formatVisitorFallback } from '@/utils/ip-resolver';

export { resolveIpIdentity, isGenericOrInvalidCompany, maskIp, formatVisitorFallback };

export async function resolveVisitorIdentity(ip: string): Promise<{ companyName: string | null; isIdentified: boolean; companyDomain: string | null; companyData: any | null; isISP: boolean }> {
  const result = await resolveIpIdentity(ip);
  return {
    companyName: result.companyName,
    isIdentified: result.isIdentified,
    companyDomain: result.domain,
    companyData: result.companyData,
    isISP: result.isIsp,
  };
}
