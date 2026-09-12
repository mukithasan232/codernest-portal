'use client';

import { useState, useEffect } from 'react';
import {
  Bell, Phone, MessageSquare, Send, CheckCircle2,
  Clock, AlertTriangle, Trash2, Plus, RefreshCw,
  ShieldCheck, Smartphone, Check, Loader2, Play
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  requestChannelOtp,
  verifyChannelOtp,
  toggleChannelStatus,
  deleteAlertChannel,
  dispatchTestAlert,
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

  // Test Alert Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testMessage, setTestMessage] = useState('Critical system update: High-priority inquiry received from Enterprise client.');
  const [testingAlert, setTestingAlert] = useState(false);

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
  const handleVerifyExisting = (channel: AlertChannel) => {
    setSelectedPlatform(channel.platform);
    setIdentifier(channel.identifier);
    setLabel(channel.label || '');
    setOtp('');
    setStep(3);
    setCountdown(300);
    setIsModalOpen(true);
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

      toast.success(res.message || 'OTP code sent via SMS!');
      if (res.sandboxDevCode) {
        setSandboxCode(res.sandboxDevCode);
      }
      setCountdown(300);
      setResendCooldown(30);
      setStep(3);
    } catch {
      toast.error('Network error requesting OTP');
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

  // Trigger test alert broadcast
  const handleSendTestBroadcast = async () => {
    if (!testMessage.trim()) {
      toast.error('Please enter a message to broadcast');
      return;
    }

    setTestingAlert(true);
    try {
      const res = await dispatchTestAlert(testMessage.trim());
      if (res.success) {
        toast.success(res.message || 'Test alert dispatched!');
        setIsTestModalOpen(false);
      } else {
        toast.error(res.error || 'Failed to dispatch test alert');
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

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setIsTestModalOpen(true)}
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
                    <button
                      onClick={() => handleVerifyExisting(channel)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold transition-all"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify OTP Now
                    </button>
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
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Step 1: Platform Selection */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    Select the notification gateway to connect to CoderNest's real-time alert system:
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
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      {selectedPlatform === 'TELEGRAM'
                        ? 'Telegram Chat ID or Mobile Number'
                        : 'Phone Number (International format with country code)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={selectedPlatform === 'TELEGRAM' ? '@username or 123456789' : '+8801700000000'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1.5">
                      {selectedPlatform === 'SMS' || selectedPlatform === 'WHATSAPP'
                        ? 'Example: +8801712345678 (Bangladesh) or +14155552671 (USA)'
                        : 'Your Telegram numerical Chat ID or linked phone'}
                    </p>
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

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3.5 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-300">
                      We will dispatch a secure 6-digit verification code via SMS to confirm phone ownership before activating alerts.
                    </p>
                  </div>

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending Code...
                        </>
                      ) : (
                        <>
                          Send Verification Code ➔
                        </>
                      )}
                    </button>
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

                  {/* Sandbox Dev Code Banner (shown when running in non-production) */}
                  {sandboxCode && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                      <p className="text-xs text-emerald-400 font-medium">
                        🛠️ Sandbox Dev Mode OTP: <span className="font-mono font-bold tracking-widest text-white">{sandboxCode}</span>
                      </p>
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

                  <div className="pt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                    >
                      Change Number
                    </button>

                    <button
                      type="submit"
                      disabled={loading || otp.length !== 6 || countdown <= 0}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-50"
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
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── TEST BROADCAST MODAL ─────────────────────────────────────────── */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
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

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
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
                      Dispatch Broadcast
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
