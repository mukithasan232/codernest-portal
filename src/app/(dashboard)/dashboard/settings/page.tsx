import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const appUser = await prisma.user.findUnique({ where: { id: session.user.id }});
  
  if (!appUser) {
    redirect('/auth/login');
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account preferences and details.</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:bg-[#0f172a] dark:border-white/10 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Name</label>
          <input 
            type="text" 
            disabled 
            value={appUser.name || ''} 
            className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white opacity-70 cursor-not-allowed"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
          <input 
            type="email" 
            disabled 
            value={appUser.email || ''} 
            className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white opacity-70 cursor-not-allowed"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Role</label>
          <input 
            type="text" 
            disabled 
            value={appUser.role} 
            className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white opacity-70 cursor-not-allowed uppercase"
          />
        </div>

        <p className="text-xs text-slate-500 mt-4">
          * Account details are currently managed by the administrator. Contact support to update your profile.
        </p>
      </div>
    </div>
  );
}
