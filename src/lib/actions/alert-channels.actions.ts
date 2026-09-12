'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import { sendSms } from '@/lib/services/sms.service';
import { sendWhatsAppTextMessage } from '@/lib/services/whatsapp.service';
import { sendTelegramMessage } from '@/lib/services/telegram.service';
import { dispatchAdminAlert } from '@/lib/notifications.service';
import type { ChannelPlatform, AlertChannel } from '@/types';

// Helper to assert Super Admin access
async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized. Please log in.');
  }

  const appUser = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (appUser?.role !== 'SUPER_ADMIN') {
    throw new Error('Forbidden. Super Admin access required.');
  }

  return appUser;
}

// Hash OTP with SHA-256 for secure DB storage
function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Normalize phone number to E.164 format (+XXXXXXXXXXX)
 * Automatically handles Bangladesh local format (01XXXXXXXXX -> +8801XXXXXXXXX)
 */
function normalizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, '').trim();

  // Bangladesh local 11-digit format: 013..., 017..., 018..., 019...
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return `+88${cleaned}`;
  }

  // BD format with 88 without plus: 8801XXXXXXXXX
  if (cleaned.startsWith('8801') && cleaned.length === 13) {
    return `+${cleaned}`;
  }

  if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }
  return cleaned;
}

/**
 * 1. Fetch all configured alert channels
 */
export async function getAlertChannels() {
  try {
    await requireSuperAdmin();

    const channels = await prisma.alertChannel.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      data: channels.map((c) => ({
        ...c,
        id: c.id.toString(),
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        otpExpiresAt: c.otpExpiresAt ? c.otpExpiresAt.toISOString() : null,
      })) as AlertChannel[],
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch alert channels',
      data: [] as AlertChannel[],
    };
  }
}

export interface RequestOtpParams {
  platform: ChannelPlatform;
  identifier: string;
  label?: string;
}

/**
 * 2. Request OTP for a channel
 * Generates a 6-digit OTP, saves hash with 5-minute expiry, and sends via SMS.
 */
export async function requestChannelOtp({
  platform,
  identifier,
  label,
}: RequestOtpParams) {
  try {
    await requireSuperAdmin();

    let cleanIdentifier = identifier.trim();

    if (!cleanIdentifier) {
      return { success: false, error: 'Phone number or identifier is required.' };
    }

    if (platform === 'SMS' || platform === 'WHATSAPP') {
      cleanIdentifier = normalizePhoneNumber(cleanIdentifier);
      const digitsOnly = cleanIdentifier.replace(/\D/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        return {
          success: false,
          error: 'Please enter a valid international phone number with country code (e.g., +8801700000000 or +14155552671).',
        };
      }
    }

    // Generate secure 6-digit OTP (100000 - 999999)
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(otp);
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Upsert the channel record in DB
    await prisma.alertChannel.upsert({
      where: {
        platform_identifier: {
          platform,
          identifier: cleanIdentifier,
        },
      },
      update: {
        label: label?.trim() || undefined,
        otpHash,
        otpExpiresAt,
      },
      create: {
        platform,
        identifier: cleanIdentifier,
        label: label?.trim() || null,
        isVerified: false,
        isActive: false,
        otpHash,
        otpExpiresAt,
      },
    });

    // 1. Direct Telegram OTP Dispatch
    if (platform === 'TELEGRAM') {
      const tgOtpText = `🔐 <b>CoderNest Admin Verification</b>:\nYour code is <code>${otp}</code>. Valid for 5 minutes.`;
      const tgRes = await sendTelegramMessage({
        chatId: cleanIdentifier,
        text: tgOtpText,
        parseMode: 'HTML',
      });

      if (!tgRes.success) {
        console.warn('[Alert Channel Action] Direct Telegram OTP failed:', tgRes.error);
        // If identifier is also a numeric phone number, attempt SMS fallback
        const digitsOnly = cleanIdentifier.replace(/\D/g, '');
        if (digitsOnly.length >= 8) {
          await sendSms({
            to: cleanIdentifier,
            message: `Your CoderNest Telegram verification code is: ${otp}. Valid for 5 minutes.`,
          });
        }
      }
    } else {
      // 2. Dispatch OTP via SMS for SMS and WhatsApp verification
      const smsMessage = `Your CoderNest verification code is: ${otp}. Valid for 5 minutes.`;
      const smsResult = await sendSms({
        to: cleanIdentifier,
        message: smsMessage,
      });

      if (!smsResult.success) {
        console.warn('[Alert Channel Action] SMS dispatch note:', smsResult.error);
      }
    }

    revalidatePath('/admin/settings/alerts');

    return {
      success: true,
      message: platform === 'TELEGRAM'
        ? `Verification code sent to Telegram ${cleanIdentifier}`
        : `Verification code sent to ${cleanIdentifier}`,
      platform,
      identifier: cleanIdentifier,
      // Super Admin bypass & test fallback: always provide the generated OTP for one-click fill
      devCode: otp,
      sandboxDevCode: otp,
    };
  } catch (error: unknown) {
    console.error('Request OTP Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate verification OTP',
    };
  }
}

/**
 * 2b. Direct Super Admin Quick-Add (Bypass Option)
 * Skips OTP check and sets isVerified: true, isActive: true immediately since session is authenticated.
 */
export async function quickConnectChannel({
  platform,
  identifier,
  label,
}: RequestOtpParams) {
  try {
    await requireSuperAdmin();

    let cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      return { success: false, error: 'Phone number or identifier is required.' };
    }

    if (platform === 'SMS' || platform === 'WHATSAPP') {
      cleanIdentifier = normalizePhoneNumber(cleanIdentifier);
      const digitsOnly = cleanIdentifier.replace(/\D/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 15) {
        return {
          success: false,
          error: 'Please enter a valid phone number (e.g. +8801700000000 or 017XXXXXXXX).',
        };
      }
    } else if (platform === 'TELEGRAM') {
      // Remove any leading plus sign if mistakenly entered for a Telegram chat ID
      cleanIdentifier = cleanIdentifier.replace(/^\+/, '').trim();
    }

    // Upsert directly with isVerified: true, isActive: true
    const channel = await prisma.alertChannel.upsert({
      where: {
        platform_identifier: {
          platform,
          identifier: cleanIdentifier,
        },
      },
      update: {
        label: label?.trim() || undefined,
        isVerified: true,
        isActive: true,
        otpHash: null,
        otpExpiresAt: null,
      },
      create: {
        platform,
        identifier: cleanIdentifier,
        label: label?.trim() || null,
        isVerified: true,
        isActive: true,
        otpHash: null,
        otpExpiresAt: null,
      },
    });

    // Send immediate welcome test alert
    try {
      const welcomeMsg = `🎉 CoderNest Alert Gateway: Channel ${channel.label || channel.identifier} (${platform}) has been successfully connected and activated by Super Admin!`;
      if (platform === 'SMS') {
        await sendSms({ to: cleanIdentifier, message: welcomeMsg });
      } else if (platform === 'WHATSAPP') {
        await sendWhatsAppTextMessage(cleanIdentifier, welcomeMsg);
      } else if (platform === 'TELEGRAM') {
        await sendTelegramMessage({ chatId: cleanIdentifier, text: welcomeMsg });
      }
    } catch (notifyErr) {
      console.warn('[Quick Connect] Welcome ping notice:', notifyErr);
    }

    revalidatePath('/admin/settings/alerts');

    return {
      success: true,
      message: `${platform} channel verified and connected instantly!`,
      channel: {
        ...channel,
        id: channel.id.toString(),
      },
    };
  } catch (error: unknown) {
    console.error('Quick Connect Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to connect channel.',
    };
  }
}

export interface VerifyOtpParams {
  platform: ChannelPlatform;
  identifier: string;
  otp: string;
}

/**
 * 3. Verify OTP and activate channel
 */
export async function verifyChannelOtp({
  platform,
  identifier,
  otp,
}: VerifyOtpParams) {
  try {
    await requireSuperAdmin();

    let cleanIdentifier = identifier.trim();
    if (platform === 'SMS' || platform === 'WHATSAPP') {
      cleanIdentifier = normalizePhoneNumber(cleanIdentifier);
    }

    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      return { success: false, error: 'Please enter a valid 6-digit OTP code.' };
    }

    let channel = await prisma.alertChannel.findUnique({
      where: {
        platform_identifier: {
          platform,
          identifier: cleanIdentifier,
        },
      },
    });

    // Fallback: check with raw input if normalized didn't find a record
    if (!channel && cleanIdentifier !== identifier.trim()) {
      channel = await prisma.alertChannel.findUnique({
        where: {
          platform_identifier: {
            platform,
            identifier: identifier.trim(),
          },
        },
      });
    }

    if (!channel) {
      return { success: false, error: 'Verification record not found. Please request a new code.' };
    }

    if (!channel.otpExpiresAt || new Date() > channel.otpExpiresAt) {
      return { success: false, error: 'Verification code has expired. Please request a new code.' };
    }

    const inputHash = hashOtp(cleanOtp);
    if (inputHash !== channel.otpHash) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    // Code is valid: Mark as verified and active, clear OTP
    const updated = await prisma.alertChannel.update({
      where: { id: channel.id },
      data: {
        isVerified: true,
        isActive: true,
        otpHash: null,
        otpExpiresAt: null,
      },
    });

    // Send a welcome test alert to the verified channel
    const welcomeMsg = `🎉 Welcome to CoderNest Alerts! This channel (${channel.label || channel.identifier}) is now verified and active for real-time system notifications.`;

    try {
      if (channel.platform === 'SMS') {
        await sendSms({ to: channel.identifier, message: welcomeMsg });
      } else if (channel.platform === 'WHATSAPP') {
        await sendWhatsAppTextMessage(channel.identifier, welcomeMsg);
      } else if (channel.platform === 'TELEGRAM') {
        await sendTelegramMessage({ chatId: channel.identifier, text: welcomeMsg });
      }
    } catch (deliveryError) {
      console.warn('[Welcome Alert] Could not send initial ping:', deliveryError);
    }

    revalidatePath('/admin/settings/alerts');

    return {
      success: true,
      message: 'Channel verified and activated successfully!',
      channel: {
        ...updated,
        id: updated.id.toString(),
      },
    };
  } catch (error: unknown) {
    console.error('Verify OTP Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Verification failed.',
    };
  }
}

/**
 * 4. Toggle channel active/muted status
 */
export async function toggleChannelStatus({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  try {
    await requireSuperAdmin();

    const updated = await prisma.alertChannel.update({
      where: { id },
      data: { isActive },
    });

    revalidatePath('/admin/settings/alerts');

    return {
      success: true,
      message: isActive ? 'Channel alerts activated.' : 'Channel alerts muted.',
      isActive: updated.isActive,
    };
  } catch (error: unknown) {
    console.error('Toggle Channel Status Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update channel status.',
    };
  }
}

/**
 * 5. Delete an alert channel
 */
export async function deleteAlertChannel(id: string) {
  try {
    await requireSuperAdmin();

    await prisma.alertChannel.delete({
      where: { id },
    });

    revalidatePath('/admin/settings/alerts');

    return { success: true, message: 'Alert channel removed.' };
  } catch (error: unknown) {
    console.error('Delete Alert Channel Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete channel.',
    };
  }
}

/**
 * 6. Send manual test alert to all verified active channels
 */
export async function dispatchTestAlert(customMessage?: string) {
  try {
    await requireSuperAdmin();

    const summary = await dispatchAdminAlert({
      title: 'Manual Test Broadcast',
      message: customMessage || 'This is a test notification from your CoderNest Multi-Channel Alert Gateway. All active verification pipelines are running at 100% capacity.',
      data: {
        Timestamp: new Date().toLocaleString(),
        Environment: process.env.NODE_ENV || 'production',
        Dispatcher: 'Admin Manual Trigger',
      },
    });

    const failedItems = summary.results.filter((r) => !r.success);
    const failureList = failedItems
      .map((r) => `• ${r.platform} (${r.identifier}): ${r.error || 'Failed'}`)
      .join('\n');

    let message = `Test alert dispatched to ${summary.successfulDispatches} of ${summary.totalChannels} active channels.`;
    if (summary.successfulDispatches === 0 && summary.totalChannels > 0) {
      message = `All ${summary.totalChannels} channels failed.\n${failureList}`;
    } else if (failedItems.length > 0) {
      message = `Dispatched to ${summary.successfulDispatches} of ${summary.totalChannels} channels.\nFailures:\n${failureList}`;
    }

    return {
      success: summary.successfulDispatches > 0,
      message,
      summary,
    };
  } catch (error: unknown) {
    console.error('Dispatch Test Alert Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to dispatch test alert.',
    };
  }
}

/**
 * 7. Fetch configured gateway credentials from SystemSettings / env
 */
export async function getGatewaySettings() {
  try {
    await requireSuperAdmin();

    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'global_settings' },
      select: {
        telegramBotToken: true,
        whatsappAccessToken: true,
        whatsappPhoneId: true,
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioPhoneNumber: true,
      },
    });

    return {
      success: true,
      data: {
        telegramBotToken: settings?.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN || '',
        whatsappAccessToken: settings?.whatsappAccessToken || process.env.WHATSAPP_ACCESS_TOKEN || '',
        whatsappPhoneId: settings?.whatsappPhoneId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        twilioAccountSid: settings?.twilioAccountSid || process.env.TWILIO_ACCOUNT_SID || '',
        twilioAuthToken: settings?.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN || '',
        twilioPhoneNumber: settings?.twilioPhoneNumber || process.env.TWILIO_PHONE_NUMBER || '',
      },
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch gateway settings',
    };
  }
}

/**
 * 8. Save gateway credentials directly in MongoDB
 */
export async function saveGatewaySettings(data: {
  telegramBotToken?: string;
  whatsappAccessToken?: string;
  whatsappPhoneId?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}) {
  try {
    await requireSuperAdmin();

    await prisma.systemSettings.upsert({
      where: { id: 'global_settings' },
      update: {
        telegramBotToken: data.telegramBotToken?.trim() || null,
        whatsappAccessToken: data.whatsappAccessToken?.trim() || null,
        whatsappPhoneId: data.whatsappPhoneId?.trim() || null,
        twilioAccountSid: data.twilioAccountSid?.trim() || null,
        twilioAuthToken: data.twilioAuthToken?.trim() || null,
        twilioPhoneNumber: data.twilioPhoneNumber?.trim() || null,
      },
      create: {
        id: 'global_settings',
        telegramBotToken: data.telegramBotToken?.trim() || null,
        whatsappAccessToken: data.whatsappAccessToken?.trim() || null,
        whatsappPhoneId: data.whatsappPhoneId?.trim() || null,
        twilioAccountSid: data.twilioAccountSid?.trim() || null,
        twilioAuthToken: data.twilioAuthToken?.trim() || null,
        twilioPhoneNumber: data.twilioPhoneNumber?.trim() || null,
      },
    });

    revalidatePath('/admin/settings/alerts');

    return {
      success: true,
      message: 'Gateway API credentials successfully saved and activated in database!',
    };
  } catch (error: unknown) {
    console.error('Save Gateway Settings Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save gateway settings.',
    };
  }
}

/**
 * 9. Live verify Telegram Bot Token with Telegram API
 */
export async function verifyTelegramBotToken(token: string) {
  try {
    await requireSuperAdmin();

    const cleanToken = token.trim();
    if (!cleanToken || !cleanToken.includes(':')) {
      return {
        success: false,
        error: "Invalid token format. A valid token from @BotFather must contain a colon (e.g. '8787866779:AAH...').",
      };
    }

    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
    const data = await res.json();

    if (!data.ok) {
      return {
        success: false,
        error: data.description || 'Telegram API returned failure. Please verify the token from @BotFather.',
      };
    }

    return {
      success: true,
      bot: {
        id: data.result.id,
        firstName: data.result.first_name,
        username: data.result.username,
      },
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error verifying Telegram token.',
    };
  }
}
