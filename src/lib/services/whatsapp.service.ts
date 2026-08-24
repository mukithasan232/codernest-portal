/**
 * Utility for sending WhatsApp messages using Meta Graph API v20.0
 * 
 * Required Environment Variables:
 * - WHATSAPP_ACCESS_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 */

export interface WhatsAppTemplatePayload {
  to: string;
  templateName: string;
  languageCode?: string;
  components?: Array<any>;
}

export const sendWhatsAppTemplateMessage = async ({
  to,
  templateName,
  languageCode = 'en_US',
  components = [],
}: WhatsAppTemplatePayload) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('WhatsApp API credentials are not configured in environment variables.');
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: to.replace(/\D/g, ''), // Ensure the phone number contains only digits
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode,
      },
      components,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Error in sendWhatsAppTemplateMessage:', error instanceof Error ? error.message : "An unknown error occurred");
    throw error;
  }
};

/**
 * Utility for sending a simple text message via WhatsApp
 */
export const sendWhatsAppTextMessage = async (to: string, text: string) => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    throw new Error('WhatsApp API credentials are not configured.');
  }

  const url = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to.replace(/\D/g, ''),
    type: 'text',
    text: { body: text },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API Error:', data);
      throw new Error(data.error?.message || 'Failed to send WhatsApp message');
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Error in sendWhatsAppTextMessage:', error instanceof Error ? error.message : "An unknown error occurred");
    throw error;
  }
};
