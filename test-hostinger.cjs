require('dotenv').config();

async function fetchHostinger() {
  const token = process.env.HOSTINGER_API_KEY;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  try {
    const res = await fetch('https://developers.hostinger.com/api/hosting/v1/websites', { headers });
    const data = await res.json();
    console.log("Websites Status:", res.status);
    console.log("Websites:", JSON.stringify(data).substring(0, 500));
  } catch(e) {
    console.error("Websites Error:", e);
  }
}

fetchHostinger();
