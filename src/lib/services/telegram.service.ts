/**
 * Telegram Bot API Alert Service
 * 
 * Uses TELEGRAM_BOT_TOKEN to dispatch alerts directly to verified Chat IDs / Channels.
 */

export interface SendTelegramPayload {
  chatId: string;
  text: string;
  parseMode?: 'HTML' | 'Markdown' | 'MarkdownV2';
}

export interface SendTelegramResult {
  success: boolean;
  messageId?: number | string;
  error?: string;
  mode?: 'telegram-api' | 'sandbox';
}

export async function sendTelegramMessage({
  chatId,
  text,
  parseMode = 'HTML',
}: SendTelegramPayload): Promise<SendTelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (token) {
    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId.trim(),
          text,
          parse_mode: parseMode,
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        console.error('[Telegram Service] API Error:', data);
        return { success: false, error: data.description || 'Telegram dispatch failed' };
      }

      return {
        success: true,
        messageId: data.result?.message_id,
        mode: 'telegram-api',
      };
    } catch (error: unknown) {
      console.error('[Telegram Service] Exception:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Telegram error',
      };
    }
  }

  // Fallback Sandbox Mode
  console.log(`\n================== [TELEGRAM GATEWAY SANDBOX] ==================`);
  console.log(`✈️ CHAT ID   : ${chatId}`);
  console.log(`💬 MESSAGE   : ${text}`);
  console.log(`🕒 TIMESTAMP : ${new Date().toISOString()}`);
  console.log(`================================================================\n`);

  return {
    success: true,
    messageId: `sandbox-tg-${Date.now()}`,
    mode: 'sandbox',
  };
}
