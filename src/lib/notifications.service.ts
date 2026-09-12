import { prisma } from '@/lib/prisma';
import { sendSms } from '@/lib/services/sms.service';
import { sendWhatsAppTextMessage } from '@/lib/services/whatsapp.service';
import { sendTelegramMessage } from '@/lib/services/telegram.service';

export interface AdminAlertOptions {
  title?: string;
  message: string;
  subject?: string;
  data?: Record<string, any>;
}

export interface ChannelDispatchResult {
  channelId: string;
  platform: 'SMS' | 'WHATSAPP' | 'TELEGRAM';
  identifier: string;
  success: boolean;
  error?: string;
}

export interface DispatchSummary {
  success: boolean;
  totalChannels: number;
  successfulDispatches: number;
  failedDispatches: number;
  results: ChannelDispatchResult[];
}

/**
 * Universal Multi-Channel Admin Alert Dispatcher
 * Broadcasts critical alerts to all verified & active channels (SMS, WhatsApp, Telegram).
 */
export async function dispatchAdminAlert(
  payload: string | AdminAlertOptions
): Promise<DispatchSummary> {
  const options: AdminAlertOptions =
    typeof payload === 'string'
      ? { message: payload, title: 'System Notification' }
      : payload;

  const title = options.title || 'System Notification';
  const rawMessage = options.message;

  // Append formatted extra data if provided
  let formattedData = '';
  if (options.data && Object.keys(options.data).length > 0) {
    formattedData = '\n\n' + Object.entries(options.data)
      .map(([k, v]) => `• ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');
  }

  const fullMessage = `${rawMessage}${formattedData}`;

  try {
    // 1. Fetch all active and verified notification channels
    const activeChannels = await prisma.alertChannel.findMany({
      where: {
        isVerified: true,
        isActive: true,
      },
    });

    if (activeChannels.length === 0) {
      console.log('[Alert Dispatcher] No active verified alert channels configured.');
      return {
        success: true,
        totalChannels: 0,
        successfulDispatches: 0,
        failedDispatches: 0,
        results: [],
      };
    }

    // 2. Concurrently broadcast to all active channels
    const dispatchPromises = activeChannels.map(async (channel): Promise<ChannelDispatchResult> => {
      try {
        if (channel.platform === 'SMS') {
          const smsText = `🚨 [CoderNest]\n${title}\n\n${fullMessage}`;
          const res = await sendSms({ to: channel.identifier, message: smsText });
          return {
            channelId: channel.id,
            platform: 'SMS',
            identifier: channel.identifier,
            success: res.success,
            error: res.error,
          };
        }

        if (channel.platform === 'WHATSAPP') {
          const waText = `🚨 *CoderNest Alert: ${title}*\n\n${fullMessage}`;
          await sendWhatsAppTextMessage(channel.identifier, waText);
          return {
            channelId: channel.id,
            platform: 'WHATSAPP',
            identifier: channel.identifier,
            success: true,
          };
        }

        if (channel.platform === 'TELEGRAM') {
          const tgText = `🚨 <b>CoderNest Alert: ${title}</b>\n\n${fullMessage.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}`;
          const res = await sendTelegramMessage({ chatId: channel.identifier, text: tgText });
          return {
            channelId: channel.id,
            platform: 'TELEGRAM',
            identifier: channel.identifier,
            success: res.success,
            error: res.error,
          };
        }

        return {
          channelId: channel.id,
          platform: channel.platform,
          identifier: channel.identifier,
          success: false,
          error: `Unsupported platform: ${channel.platform}`,
        };
      } catch (err: unknown) {
        console.error(`[Alert Dispatcher] Error sending to ${channel.platform} (${channel.identifier}):`, err);
        return {
          channelId: channel.id,
          platform: channel.platform,
          identifier: channel.identifier,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown dispatch error',
        };
      }
    });

    const results = await Promise.all(dispatchPromises);
    const successfulDispatches = results.filter((r) => r.success).length;
    const failedDispatches = results.filter((r) => !r.success).length;

    return {
      success: successfulDispatches > 0 || activeChannels.length === 0,
      totalChannels: activeChannels.length,
      successfulDispatches,
      failedDispatches,
      results,
    };
  } catch (error: unknown) {
    console.error('[Alert Dispatcher] Fatal error in dispatchAdminAlert:', error);
    return {
      success: false,
      totalChannels: 0,
      successfulDispatches: 0,
      failedDispatches: 0,
      results: [],
    };
  }
}
