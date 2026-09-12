/**
 * SMS Gateway Service
 * 
 * Supports:
 * 1. Twilio REST API (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)
 * 2. Generic SMS HTTP Gateway (GENERIC_SMS_API_URL, GENERIC_SMS_API_KEY)
 * 3. Local/Development Sandbox fallback with console OTP delivery
 */

export interface SendSmsPayload {
  to: string;
  message: string;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  mode?: 'twilio' | 'generic' | 'sandbox';
}

export async function sendSms({ to, message }: SendSmsPayload): Promise<SendSmsResult> {
  const cleanPhone = to.trim();

  // 1. Check for Twilio Credentials
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID;

  if (twilioAccountSid && twilioAuthToken && twilioFrom) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const basicAuth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');

      const formData = new URLSearchParams();
      formData.append('To', cleanPhone);
      formData.append('From', twilioFrom);
      formData.append('Body', message);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[SMS Service] Twilio Error:', data);
        return { success: false, error: data.message || 'Twilio SMS dispatch failed' };
      }

      return { success: true, messageId: data.sid, mode: 'twilio' };
    } catch (error: unknown) {
      console.error('[SMS Service] Twilio Exception:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown Twilio error' };
    }
  }

  // 2. Check for Generic SMS API Endpoint (e.g., local carrier / webhook)
  const genericSmsUrl = process.env.GENERIC_SMS_API_URL;
  const genericSmsKey = process.env.GENERIC_SMS_API_KEY;

  if (genericSmsUrl) {
    try {
      const response = await fetch(genericSmsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(genericSmsKey ? { Authorization: `Bearer ${genericSmsKey}`, 'X-API-Key': genericSmsKey } : {}),
        },
        body: JSON.stringify({
          to: cleanPhone,
          message,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { success: false, error: data?.error || 'Generic SMS Gateway returned error' };
      }

      return { success: true, messageId: data?.id || 'generic-ok', mode: 'generic' };
    } catch (error: unknown) {
      console.error('[SMS Service] Generic SMS Exception:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Generic SMS error' };
    }
  }

  // 3. Fallback Sandbox Mode (Local Dev / Staging without live credentials)
  console.log(`\n================== [SMS GATEWAY SANDBOX] ==================`);
  console.log(`📱 RECIPIENT : ${cleanPhone}`);
  console.log(`💬 MESSAGE   : ${message}`);
  console.log(`🕒 TIMESTAMP : ${new Date().toISOString()}`);
  console.log(`===========================================================\n`);

  return {
    success: true,
    messageId: `sandbox-${Date.now()}`,
    mode: 'sandbox',
  };
}
