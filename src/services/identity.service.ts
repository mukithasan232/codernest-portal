export async function resolveVisitorIdentity(ip: string): Promise<{ companyName: string | null; isIdentified: boolean }> {
  // If IP is localhost or local network, skip
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'Unknown' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { companyName: null, isIdentified: false };
  }

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,org,isp,query`, {
      // 2.5 second timeout to avoid blocking the request for too long
      signal: AbortSignal.timeout(2500)
    });
    
    if (!res.ok) {
      return { companyName: null, isIdentified: false };
    }

    const data = await res.json();
    if (data.status !== 'success' || !data.org) {
      return { companyName: null, isIdentified: false };
    }

    const org = data.org as string;
    const isp = data.isp as string;
    
    // Filter out common residential ISPs
    const residentialIsps = [
      'comcast', 'verizon', 'spectrum', 'att', 'at&t', 't-mobile', 'tmobile',
      'cox', 'centurylink', 'charter', 'xfinity', 'optimum', 'suddenlink',
      'frontier', 'windstream', 'mediacom', 'google fiber', 'starlink',
      'bt', 'virgin media', 'sky broadband', 'talktalk', 'bell', 'rogers',
      'telus', 'shaw', 'telstra', 'optus', 'vodafone', 'orange', 'telefonica',
      'telekom', 'isp', 'internet service provider', 'broadband', 'telecom', 'mobile'
    ];

    const isResidential = residentialIsps.some(blocked => 
      org.toLowerCase().includes(blocked) || isp.toLowerCase().includes(blocked)
    );

    if (isResidential) {
      return { companyName: null, isIdentified: false };
    }

    return { companyName: org, isIdentified: true };
  } catch (error) {
    console.error(`[Identity Service] Failed to resolve IP ${ip}:`, error);
    return { companyName: null, isIdentified: false };
  }
}
