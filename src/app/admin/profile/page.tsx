'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Camera, Save, Lock, User, Shield, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminProfilePage() {
  const { appUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and security settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-6 text-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
            
            <div className="relative mt-8 mb-4">
              <div className="w-28 h-28 mx-auto rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden group">
                {appUser?.photoURL ? (
                  <Image src={appUser.photoURL} alt="Avatar" width={112} height={112} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-slate-400 dark:text-slate-500">
                    {appUser?.displayName?.charAt(0) || 'A'}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{appUser?.displayName || 'Admin User'}</h3>
            <div className="flex items-center justify-center gap-1.5 mt-2 text-blue-600 dark:text-blue-400 text-sm font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-500/10 w-max mx-auto px-3 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              {appUser?.role?.replace('_', ' ') || 'Super Admin'}
            </div>
          </div>
        </div>

        {/* Right Column: Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Personal Info Form */}
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Personal Information</h2>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input 
                    type="text" 
                    defaultValue={appUser?.displayName || ''}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input 
                    type="email" 
                    defaultValue={appUser?.email || ''}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Role</label>
                <input 
                  type="text" 
                  value={appUser?.role?.replace('_', ' ') || 'Super Admin'}
                  disabled
                  className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-2.5 text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">Your role determines your access level and cannot be changed here.</p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-4">
                {successMsg && (
                  <span className="text-sm font-medium text-green-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> {successMsg}
                  </span>
                )}
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </div>
          </form>

          {/* Security Form */}
          <form className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security</h2>
            </div>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Current Password</label>
                <input 
                  type="password" 
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white transition-all"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">New Password</label>
                  <input 
                    type="password" 
                    placeholder="Create new password"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <input 
                    type="password" 
                    placeholder="Confirm new password"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none text-slate-900 dark:text-white transition-all"
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  type="button"
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 dark:text-slate-900 text-white font-bold rounded-xl transition-all"
                >
                  Update Password
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
