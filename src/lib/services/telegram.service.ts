import { prisma } from '@/lib/prisma';

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

/**
 * Helper to retrieve Telegram Bot Token from process.env or database SystemSettings
 */
export async function resolveTelegramBotToken(): Promise<string | null> {
  const envToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (envToken && envToken !== 'your_telegram_bot_token_here') {
    return envToken;
  }

  try {
    const settings = await (prisma.systemSettings as any).findUnique({
      where: { id: 'global_settings' },
      select: { telegramBotToken: true },
    });
    return (settings?.telegramBotToken as string | null | undefined)?.trim() || null;
  } catch {
    return null;
  }
}

export async function sendTelegramMessage({
  chatId,
  text,
  parseMode = 'HTML',
}: SendTelegramPayload): Promise<SendTelegramResult> {
  const token = await resolveTelegramBotToken();

  if (token) {
    // Validate token format: Bot tokens from @BotFather ALWAYS contain a colon ":" (e.g. 123456789:ABC...)
    if (!token.includes(':')) {
      return {
        success: false,
        error: `Invalid Telegram Bot Token format. You entered '${token}', which looks like a Bot ID. The full token from @BotFather must include the secret hash after a colon (e.g. ${token}:AAH...).`,
      };
    }

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
        let errorDesc = data.description || 'Telegram dispatch failed';

        if (errorDesc.includes('chat not found')) {
          errorDesc = `Chat ID ${chatId} not found. Please open your bot in Telegram and click 'Start' (/start) once so it has permission to message you.`;
        } else if (errorDesc.includes('Not Found') || data.error_code === 404) {
          errorDesc = 'Invalid Bot Token. Telegram Bot API returned 404 Not Found. Please check the token provided by @BotFather.';
        }

        return { success: false, error: errorDesc };
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
        error: error instanceof Error ? error.message : 'Unknown Telegram network error',
      };
    }
  }

  // If no token configured
  return {
    success: false,
    error: 'Telegram Bot Token is not configured. Please set TELEGRAM_BOT_TOKEN in Vercel or save it in Gateway Settings.',
  };
}
