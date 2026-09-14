require('dotenv').config();

async function fetchLocal() {
  const token = process.env.HOSTINGER_API_KEY;
  const HOSTINGER_API_URL = 'https://developers.hostinger.com/api';

  async function fetchHostinger(endpoint) {
    const res = await fetch(`${HOSTINGER_API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Hostinger API error: ${res.status}`);
    }
    return res.json();
  }
  
  try {
    const [w, v, d] = await Promise.allSettled([
      fetchHostinger('/hosting/v1/websites'),
      fetchHostinger('/vps/v1/vps'),
      fetchHostinger('/domains/v1/domains')
    ]);
    
    console.log("Websites Status:", w.status);
    if(w.status === 'rejected') console.log("Websites Error:", w.reason.message);
  } catch(e) {
    console.error("Error:", e);
  }
}
fetchLocal();
