'use client';

import { useState, useEffect } from 'react';
import {
  Bell, Phone, MessageSquare, Send, CheckCircle2,
  Clock, AlertTriangle, Trash2, Plus, RefreshCw,
  ShieldCheck, Smartphone, Check, Loader2, Play, Zap,
  Key, ExternalLink, Bot, CheckCircle, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  requestChannelOtp,
  verifyChannelOtp,
  quickConnectChannel,
  toggleChannelStatus,
  deleteAlertChannel,
  dispatchTestAlert,
  getGatewaySettings,
  saveGatewaySettings,
  verifyTelegramBotToken,
} from '@/lib/actions/alert-channels.actions';
import type { AlertChannel, ChannelPlatform } from '@/types';

interface AlertChannelsClientProps {
  initialChannels: AlertChannel[];
}

export default function AlertChannelsClient({
  initialChannels,
}: AlertChannelsClientProps) {
  const [channels, setChannels] = useState<AlertChannel[]>(initialChannels);
  const [activeTab, setActiveTab] = useState<'ALL' | ChannelPlatform>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedPlatform, setSelectedPlatform] = useState<ChannelPlatform>('SMS');
  const [identifier, setIdentifier] = useState('');
  const [label, setLabel] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sandboxCode, setSandboxCode] = useState<string | null>(null);

  // Countdown timer for OTP (5 minutes = 300 seconds)
  const [countdown, setCountdown] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Test Alert Modal & Results State
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testMessage, setTestMessage] = useState('Critical system update: High-priority inquiry received from Enterprise client.');
  const [testingAlert, setTestingAlert] = useState(false);
  const [testResults, setTestResults] = useState<{
    totalChannels: number;
    successfulDispatches: number;
    failedDispatches: number;
    results: Array<{
      channelId: string;
      platform: string;
      identifier: string;
      success: boolean;
      error?: string;
    }>;
  } | null>(null);

  // Gateway Settings Modal State
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [gatewayLoading, setGatewayLoading] = useState(false);
  const [gatewaySaving, setGatewaySaving] = useState(false);
  const [gatewayTokens, setGatewayTokens] = useState({
    telegramBotToken: '',
    whatsappAccessToken: '',
    whatsappPhoneId: '',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
  });
  const [botVerification, setBotVerification] = useState<{
    status: 'idle' | 'verifying' | 'success' | 'error';
    botInfo?: { id: number; firstName: string; username?: string };
    error?: string;
  }>({ status: 'idle' });

  // Sync state if server revalidates
  useEffect(() => {
    setChannels(initialChannels);
  }, [initialChannels]);

  // Timer countdown hook
  useEffect(() => {
    if (step !== 3 || countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step, countdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Open modal for connecting a new channel
  const handleOpenNewModal = () => {
    setStep(1);
    setSelectedPlatform('SMS');
    setIdentifier('');
    setLabel('');
    setOtp('');
    setSandboxCode(null);
    setCountdown(300);
    setResendCooldown(0);
    setIsModalOpen(true);
  };

  // Open modal directly to verify an existing pending channel
  const handleVerifyExisting = async (channel: AlertChannel) => {
    setSelectedPlatform(channel.platform);
    setIdentifier(channel.identifier);
    setLabel(channel.label || '');
    setStep(3);
    setCountdown(300);
    setIsModalOpen(true);

    // Auto-fetch fresh OTP in background so admin never waits
    try {
      const res = await requestChannelOtp({
        platform: channel.platform,
        identifier: channel.identifier,
        label: channel.label || undefined,
      });
      const code = res.devCode || res.sandboxDevCode;
      if (code) {
        setSandboxCode(code);
        setOtp(code);
      }
    } catch {
      // Background fetch catch
    }
  };

  // One-click instant activation for existing pending channels
  const handleQuickConnectExisting = async (channel: AlertChannel) => {
    setLoading(true);
    try {
      const res = await quickConnectChannel({
        platform: channel.platform,
        identifier: channel.identifier,
        label: channel.label || undefined,
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to activate channel');
        setLoading(false);
        return;
      }

      toast.success(res.message || 'Channel verified and activated!');
      setChannels((prev) =>
        prev.map((c) => (c.id === channel.id ? { ...c, isVerified: true, isActive: true } : c))
      );
    } catch {
      toast.error('Network error. Please refresh the page (F5 / Cmd+R).');
    } finally {
      setLoading(false);
    }
  };

  // Direct Super Admin Quick-Add (Bypass Option)
  const handleQuickConnect = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter a phone number or identifier');
      return;
    }

    setLoading(true);
    try {
      const res = await quickConnectChannel({
        platform: selectedPlatform,
        identifier: identifier.trim(),
        label: label.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to connect channel');
        setLoading(false);
        return;
      }

      toast.success(res.message || 'Channel verified and connected instantly!');

      if (res.channel) {
        setChannels((prev) => {
          const index = prev.findIndex(
            (c) => c.platform === selectedPlatform && c.identifier === identifier.trim()
          );
          if (index >= 0) {
            const updated = [...prev];
            updated[index] = res.channel as any as AlertChannel;
            return updated;
          }
          return [res.channel as any as AlertChannel, ...prev];
        });
      }

      setIsModalOpen(false);
    } catch {
      toast.error('Failed to connect channel');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 -> Step 3: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!identifier.trim()) {
      toast.error('Please enter a phone number or identifier');
      return;
    }

    setLoading(true);
    try {
      const res = await requestChannelOtp({
        platform: selectedPlatform,
        identifier: identifier.trim(),
        label: label.trim() || undefined,
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      toast.success(res.message || 'OTP code generated!');
      const code = res.devCode || res.sandboxDevCode;
      if (code) {
        setSandboxCode(code);
        setOtp(code); // AUTO-FILL CODE DIRECTLY!
      }
      setCountdown(300);
      setResendCooldown(30);
      setStep(3);
    } catch (err: unknown) {
      console.error('Request OTP exception:', err);
      toast.error('Network error or new version deployed. Please refresh the page (F5 / Cmd+R).');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyChannelOtp({
        platform: selectedPlatform,
        identifier: identifier.trim(),
        otp: otp.trim(),
      });

      if (!res.success) {
        toast.error(res.error || 'Verification failed');
        setLoading(false);
        return;
      }

      toast.success(res.message || 'Channel verified and activated!');

      // Optimistically update list
      setChannels((prev) => {
        const index = prev.findIndex(
          (c) => c.platform === selectedPlatform && c.identifier === identifier.trim()
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            isVerified: true,
            isActive: true,
          };
          return updated;
        } else if (res.channel) {
          return [res.channel as any as AlertChannel, ...prev];
        }
        return prev;
      });

      setIsModalOpen(false);
    } catch {
      toast.error('Network error during verification');
    } finally {
      setLoading(false);
    }
  };

  // Toggle channel active/muted status
  const handleToggleActive = async (channel: AlertChannel) => {
    const newStatus = !channel.isActive;
    // Optimistic update
    setChannels((prev) =>
      prev.map((c) => (c.id === channel.id ? { ...c, isActive: newStatus } : c))
    );

    try {
      const res = await toggleChannelStatus({
        id: channel.id,
        isActive: newStatus,
      });

      if (!res.success) {
        // Rollback
        setChannels((prev) =>
          prev.map((c) => (c.id === channel.id ? { ...c, isActive: channel.isActive } : c))
        );
        toast.error(res.error || 'Failed to update channel status');
      } else {
        toast.success(res.message || 'Channel status updated');
      }
    } catch {
      setChannels((prev) =>
        prev.map((c) => (c.id === channel.id ? { ...c, isActive: channel.isActive } : c))
      );
      toast.error('Network error updating channel');
    }
  };

  // Delete channel
  const handleDelete = async (channel: AlertChannel) => {
    if (!confirm(`Are you sure you want to remove ${channel.label || channel.identifier}?`)) {
      return;
    }

    // Optimistic delete
    setChannels((prev) => prev.filter((c) => c.id !== channel.id));

    try {
      const res = await deleteAlertChannel(channel.id);
      if (!res.success) {
        setChannels(initialChannels);
        toast.error(res.error || 'Failed to remove channel');
      } else {
        toast.success(res.message || 'Channel removed');
      }
    } catch {
      setChannels(initialChannels);
      toast.error('Network error removing channel');
    }
  };

  // Open Test Modal
  const handleOpenTestModal = () => {
    setTestResults(null);
    setIsTestModalOpen(true);
  };

  // Open Gateway Credentials Modal
  const handleOpenGatewayModal = async () => {
    setIsGatewayModalOpen(true);
    setGatewayLoading(true);
    setBotVerification({ status: 'idle' });
    try {
      const res = await getGatewaySettings();
      if (res.success && res.data) {
        setGatewayTokens(res.data);
        if (res.data.telegramBotToken && res.data.telegramBotToken.includes(':')) {
          handleVerifyBot(res.data.telegramBotToken);
        }
      }
    } catch {
      toast.error('Failed to load gateway credentials');
    } finally {
      setGatewayLoading(false);
    }
  };

  // Verify Telegram Bot Token live
  const handleVerifyBot = async (tokenOverride?: string) => {
    const token = tokenOverride !== undefined ? tokenOverride : gatewayTokens.telegramBotToken;
    if (!token.trim()) {
      toast.error('Please enter a Telegram Bot Token first');
      return;
    }
    setBotVerification({ status: 'verifying' });
    try {
      const res = await verifyTelegramBotToken(token.trim());
      if (res.success && res.bot) {
        setBotVerification({
          status: 'success',
          botInfo: res.bot,
        });
        toast.success(`Connected: @${res.bot.username || res.bot.firstName}`);
      } else {
        setBotVerification({
          status: 'error',
          error: res.error || 'Verification failed. Please check the token from @BotFather.',
        });
        toast.error(res.error || 'Verification failed');
      }
    } catch {
      setBotVerification({
        status: 'error',
        error: 'Network error verifying Telegram token',
      });
    }
  };

  // Save Gateway Credentials
  const handleSaveGateway = async (e: React.FormEvent) => {
    e.preventDefault();
    setGatewaySaving(true);
    try {
      const res = await saveGatewaySettings(gatewayTokens);
      if (res.success) {
        toast.success(res.message || 'Gateway credentials saved to database!');
        setIsGatewayModalOpen(false);
      } else {
        toast.error(res.error || 'Failed to save gateway credentials');
      }
    } catch {
      toast.error('Network error saving gateway credentials');
    } finally {
      setGatewaySaving(false);
    }
  };

  // Trigger test alert broadcast
  const handleSendTestBroadcast = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a message to broadcast');
      return;
    }

    setTestingAlert(true);
    setTestResults(null);
    try {
      const res = await dispatchTestAlert(testMessage.trim());
      if (res.summary) {
        setTestResults(res.summary);
      }
      if (res.success) {
        toast.success(res.message || 'Test alert dispatched!');
      } else {
        toast.error(res.message || res.error || 'Failed to dispatch test alert');
      }
    } catch {
      toast.error('Error dispatching test alert');
    } finally {
      setTestingAlert(false);
    }
  };

  // Metric counts
  const totalCount = channels.length;
  const activeCount = channels.filter((c) => c.isVerified && c.isActive).length;
  const smsCount = channels.filter((c) => c.platform === 'SMS').length;
  const waCount = channels.filter((c) => c.platform === 'WHATSAPP').length;
  const tgCount = channels.filter((c) => c.platform === 'TELEGRAM').length;

  const filteredChannels =
    activeTab === 'ALL'
      ? channels
      : channels.filter((c) => c.platform === activeTab);

  return (
    <div className="space-y-8">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Channels</p>
              <p className="text-3xl font-extrabold text-white mt-1">{totalCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bell className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Universal Multi-Channel Alert Dispatcher
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active & Broadcasting</p>
              <p className="text-3xl font-extrabold text-emerald-400 mt-1">{activeCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {activeCount === 0 ? 'No channels currently active' : `${activeCount} channels receiving real-time alerts`}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct SMS</p>
              <p className="text-3xl font-extrabold text-purple-400 mt-1">{smsCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Twilio & Gateway SMS integrations
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WhatsApp & Telegram</p>
              <p className="text-3xl font-extrabold text-sky-400 mt-1">{waCount + tgCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Send className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-slate-500">
            {waCount} WhatsApp • {tgCount} Telegram
          </div>
        </div>
      </div>

      {/* Main Action Bar & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'SMS', 'WHATSAPP', 'TELEGRAM'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab === 'ALL' ? 'All Channels' : tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={handleOpenGatewayModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs sm:text-sm font-semibold transition-all shadow-sm"
          >
            <Key className="w-4 h-4 text-indigo-400" />
            Gateway API & Bot Setup
          </button>

          <button
            onClick={handleOpenTestModal}
            disabled={activeCount === 0}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 text-emerald-400" />
            Send Test Alert
          </button>

          <button
            onClick={handleOpenNewModal}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Connect New Channel
          </button>
        </div>
      </div>

      {/* Channels List */}
      {filteredChannels.length === 0 ? (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No Alert Channels Configured</h3>
          <p className="text-slate-400 text-sm mb-6">
            Register your mobile phone, WhatsApp, or Telegram handle to receive instantaneous alerts when new enterprise leads arrive.
          </p>
          <button
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" /> Add First Channel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels.map((channel) => {
            const isSms = channel.platform === 'SMS';
            const isWa = channel.platform === 'WHATSAPP';
            const isTg = channel.platform === 'TELEGRAM';

            return (
              <div
                key={channel.id}
                className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <div>
                  {/* Platform & Status Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSms
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            : isWa
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {isSms && <MessageSquare className="w-5 h-5" />}
                        {isWa && <Phone className="w-5 h-5" />}
                        {isTg && <Send className="w-5 h-5" />}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          {channel.platform}
                        </span>
                        <h4 className="text-base font-bold text-white line-clamp-1">
                          {channel.label || (isSms ? 'Direct SMS' : isWa ? 'WhatsApp' : 'Telegram')}
                        </h4>
                      </div>
                    </div>

                    {/* Status Badge */}
                    {channel.isVerified ? (
                      channel.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 border border-slate-600 text-slate-300">
                          Muted
                        </span>
                      )
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Clock className="w-3.5 h-3.5" />
                        Pending OTP
                      </span>
                    )}
                  </div>

                  {/* Channel Identifier / Phone Number */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 mb-5">
                    <p className="text-xs text-slate-500 font-medium mb-1">Channel Destination:</p>
                    <p className="font-mono text-sm font-semibold text-slate-200 break-all">
                      {channel.identifier}
                    </p>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  {channel.isVerified ? (
                    <div className="flex items-center gap-3">
                      {/* Active Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(channel)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          channel.isActive ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            channel.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className="text-xs text-slate-400 font-medium">
                        {channel.isActive ? 'Broadcasting' : 'Muted'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickConnectExisting(channel)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-semibold transition-all shadow-sm"
                      >
                        <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                        Activate Now
                      </button>
                      <button
                        onClick={() => handleVerifyExisting(channel)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                      >
                        Enter Code
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(channel)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete channel"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── CONNECT NEW CHANNEL MODAL ────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Connect Alert Channel</h3>
                  <p className="text-xs text-slate-400">Step {step} of 3: {step === 1 ? 'Platform' : step === 2 ? 'Destination' : 'OTP Verification'}</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Step 1: Platform Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Notification Platform
                  </p>

                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        type: 'SMS' as const,
                        name: 'Direct Mobile SMS',
                        desc: 'Receive urgent lead pings and invoices directly on your personal mobile via SMS.',
                        icon: MessageSquare,
                        color: 'text-purple-400',
                        bg: 'bg-purple-500/10 border-purple-500/20',
                      },
                      {
                        type: 'WHATSAPP' as const,
                        name: 'WhatsApp Message',
                        desc: 'Get formatted WhatsApp alerts with direct client response links via Meta Graph API.',
                        icon: Phone,
                        color: 'text-emerald-400',
                        bg: 'bg-emerald-500/10 border-emerald-500/20',
                      },
                      {
                        type: 'TELEGRAM' as const,
                        name: 'Telegram Bot Alert',
                        desc: 'Instant push notifications to your private Telegram chat or team channel.',
                        icon: Send,
                        color: 'text-sky-400',
                        bg: 'bg-sky-500/10 border-sky-500/20',
                      },
                    ].map((item) => (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          setSelectedPlatform(item.type);
                          setStep(2);
                        }}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                          selectedPlatform === item.type
                            ? 'bg-blue-600/10 border-blue-500'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.bg} ${item.color}`}>
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5 max-w-xs">{item.desc}</p>
                          </div>
                        </div>
                        <span className="text-slate-500 group-hover:text-white transition-colors">➔</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Destination & Label */}
              {step === 2 && (
                <form onSubmit={(e) => { e.preventDefault(); handleQuickConnect(); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {selectedPlatform === 'TELEGRAM'
                        ? 'Telegram Numeric Chat ID'
                        : 'Phone Number (International format or 01XXXXXXXXX)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedPlatform === 'TELEGRAM' ? 'e.g. 5228805688' : '+8801700000000 or 01302522870'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    {selectedPlatform === 'TELEGRAM' ? (
                      <div className="mt-2 p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl text-xs text-sky-300 space-y-1">
                        <p className="font-semibold text-sky-200">ℹ️ Telegram requires your numeric Chat ID (not a phone number):</p>
                        <p>1. Open Telegram, search <strong className="text-white font-mono">@userinfobot</strong>, and click <strong>Start</strong> to copy your numeric ID.</p>
                        <p>2. Open your configured alert bot and click <strong>Start</strong> once to allow it to message you.</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1.5">
                        Example: +8801712345678 or 01302522870 (Bangladesh) or +14155552671 (USA)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Channel Label (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Founder Personal Mobile, Ops WhatsApp"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-3">
                    <Zap className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-emerald-300">
                      <p className="font-semibold text-white">Instant Admin Connection:</p>
                      <p className="mt-0.5 text-slate-300">
                        Clicking <strong>Connect & Activate</strong> immediately links your alert channel. No carrier SMS waiting required!
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold order-3 sm:order-1"
                    >
                      Back
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
                      <button
                        type="button"
                        disabled={loading || !identifier.trim()}
                        onClick={(e) => handleRequestOtp(e)}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium transition-all disabled:opacity-50"
                      >
                        Test OTP Mode
                      </button>

                      <button
                        type="submit"
                        disabled={loading || !identifier.trim()}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />}
                        ⚡ Connect & Activate Channel
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Step 3: Enter OTP */}
              {step === 3 && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-bold text-white">Enter 6-Digit Code</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Verification code sent to <span className="text-blue-400 font-mono font-bold">{identifier}</span>
                    </p>
                  </div>

                  {/* Big Auto-Filled Code Banner */}
                  {sandboxCode && (
                    <div
                      onClick={() => {
                        setOtp(sandboxCode);
                        toast.success(`OTP ${sandboxCode} auto-filled!`);
                      }}
                      className="cursor-pointer bg-blue-500/20 border-2 border-blue-500/50 hover:border-blue-400 rounded-2xl p-4 text-center transition-all group shadow-lg"
                    >
                      <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">🔐 Your Verification Code:</p>
                      <p className="text-3xl font-mono font-black tracking-widest text-white">{sandboxCode}</p>
                      <p className="text-xs text-emerald-400 font-medium mt-1">✓ Auto-filled into the input box below (Click to refill)</p>
                    </div>
                  )}

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-blue-500 shadow-inner"
                    />
                  </div>

                  {/* Countdown and Resend */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      Code expires in: <strong className="text-white font-mono">{formatCountdown(countdown)}</strong>
                    </span>

                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={() => handleRequestOtp()}
                      className="text-blue-400 hover:text-blue-300 font-semibold disabled:text-slate-600 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                    </button>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold order-3 sm:order-1"
                    >
                      Change Number
                    </button>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
                      <button
                        type="button"
                        disabled={loading}
                        onClick={handleQuickConnect}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-semibold border border-amber-500/30 transition-all disabled:opacity-50"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                        Bypass & Activate
                      </button>

                      <button
                        type="submit"
                        disabled={loading || otp.length !== 6 || countdown <= 0}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            Verify & Activate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TEST BROADCAST MODAL ─────────────────────────────────────────── */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Broadcast Test Alert</h3>
                  <p className="text-xs text-slate-400">Sends a live ping to all {activeCount} active channels</p>
                </div>
              </div>
              <button
                onClick={() => setIsTestModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Test Message Payload
                </label>
                <textarea
                  rows={3}
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 resize-none font-mono"
                />
              </div>

              {/* Detailed Test Results Breakdown */}
              {testResults && (
                <div className="space-y-3 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Live Delivery Report
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        testResults.successfulDispatches > 0
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {testResults.successfulDispatches} / {testResults.totalChannels} Delivered
                    </span>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {testResults.results.map((item, idx) => {
                      const isWa = item.platform === 'WHATSAPP';
                      const isTg = item.platform === 'TELEGRAM';
                      const isSms = item.platform === 'SMS';

                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border text-xs ${
                            item.success
                              ? 'bg-emerald-500/5 border-emerald-500/20'
                              : 'bg-rose-500/5 border-rose-500/20'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-white">
                              {isTg && <Send className="w-3.5 h-3.5 text-sky-400" />}
                              {isWa && <Phone className="w-3.5 h-3.5 text-emerald-400" />}
                              {isSms && <MessageSquare className="w-3.5 h-3.5 text-purple-400" />}
                              <span>{item.platform}:</span>
                              <span className="font-mono text-slate-300 font-normal">{item.identifier}</span>
                            </div>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                item.success
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {item.success ? 'Delivered' : 'Failed'}
                            </span>
                          </div>

                          {!item.success && (
                            <div className="mt-2 p-2 rounded-lg bg-slate-950/80 border border-rose-500/20 text-[11px] text-rose-300 leading-relaxed break-words font-mono">
                              ⚠️ {item.error}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {testResults.failedDispatches > 0 && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs">
                      <span className="text-amber-300 text-[11px]">
                        Credentials missing or invalid? Configure them directly in Gateway Settings.
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsTestModalOpen(false);
                          handleOpenGatewayModal();
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold whitespace-nowrap transition-colors"
                      >
                        ⚙️ Gateway Setup
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  {testResults ? 'Close' : 'Cancel'}
                </button>
                <button
                  type="button"
                  disabled={testingAlert || !testMessage.trim()}
                  onClick={handleSendTestBroadcast}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
                >
                  {testingAlert ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {testResults ? 'Dispatch Again' : 'Dispatch Broadcast'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── GATEWAY API & BOT CREDENTIALS MODAL ───────────────────────── */}
      {isGatewayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50 sticky top-0 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Gateway API & Bot Setup</h3>
                  <p className="text-xs text-slate-400">Saved directly in database — activates immediately without redeploying</p>
                </div>
              </div>
              <button
                onClick={() => setIsGatewayModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGateway} className="p-6 space-y-6">
              {gatewayLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                  <span className="text-xs">Loading gateway configuration...</span>
                </div>
              ) : (
                <>
                  {/* Telegram Bot Section */}
                  <div className="space-y-3 p-4 rounded-2xl bg-sky-950/20 border border-sky-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Send className="w-4 h-4 text-sky-400" />
                        <span>Telegram Bot Configuration</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        Instant Free Alerts
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Bot Token (from @BotFather)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="8787866779:AAHxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={gatewayTokens.telegramBotToken}
                          onChange={(e) => {
                            setGatewayTokens((prev) => ({ ...prev, telegramBotToken: e.target.value }));
                            setBotVerification({ status: 'idle' });
                          }}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
                        />
                        <button
                          type="button"
                          disabled={botVerification.status === 'verifying' || !gatewayTokens.telegramBotToken}
                          onClick={() => handleVerifyBot()}
                          className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap"
                        >
                          {botVerification.status === 'verifying' ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          Verify Bot
                        </button>
                      </div>
                    </div>

                    {/* Bot Verification Feedback */}
                    {botVerification.status === 'success' && botVerification.botInfo && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span>Connected to: <strong>@{botVerification.botInfo.username || botVerification.botInfo.firstName}</strong> (ID: {botVerification.botInfo.id})</span>
                        </div>
                      </div>
                    )}

                    {botVerification.status === 'error' && (
                      <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
                        {botVerification.error}
                      </div>
                    )}

                    {/* Bot Instructions */}
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                      <p className="font-semibold text-slate-300">📌 Telegram Bot Instructions:</p>
                      <p>1. Open <strong className="text-white">@BotFather</strong> on Telegram → send <code className="text-sky-300">/token</code> to get the full token (format: <code className="text-sky-300">8787866779:AA...</code>).</p>
                      <p>2. Open your bot <strong className="text-white">@CoderNest_bot</strong> in Telegram and click <strong className="text-white">Start (/start)</strong> so it has permission to message your Chat ID.</p>
                    </div>
                  </div>

                  {/* WhatsApp Section */}
                  <div className="space-y-3 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span>WhatsApp Cloud API (Meta)</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Meta Graph API
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Meta System User Access Token
                      </label>
                      <input
                        type="password"
                        placeholder="EAAB..."
                        value={gatewayTokens.whatsappAccessToken}
                        onChange={(e) => setGatewayTokens((prev) => ({ ...prev, whatsappAccessToken: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        WhatsApp Phone Number ID
                      </label>
                      <input
                        type="text"
                        placeholder="10987654321..."
                        value={gatewayTokens.whatsappPhoneId}
                        onChange={(e) => setGatewayTokens((prev) => ({ ...prev, whatsappPhoneId: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Twilio SMS Section */}
                  <div className="space-y-3 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <MessageSquare className="w-4 h-4 text-purple-400" />
                        <span>Twilio Direct SMS</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        Global Carrier SMS
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Account SID
                        </label>
                        <input
                          type="text"
                          placeholder="AC..."
                          value={gatewayTokens.twilioAccountSid}
                          onChange={(e) => setGatewayTokens((prev) => ({ ...prev, twilioAccountSid: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Auth Token
                        </label>
                        <input
                          type="password"
                          placeholder="Auth Token"
                          value={gatewayTokens.twilioAuthToken}
                          onChange={(e) => setGatewayTokens((prev) => ({ ...prev, twilioAuthToken: e.target.value }))}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Twilio Phone / Sender Number
                      </label>
                      <input
                        type="text"
                        placeholder="+1234567890"
                        value={gatewayTokens.twilioPhoneNumber}
                        onChange={(e) => setGatewayTokens((prev) => ({ ...prev, twilioPhoneNumber: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsGatewayModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={gatewaySaving}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                    >
                      {gatewaySaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving Credentials...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Save & Activate Credentials
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
