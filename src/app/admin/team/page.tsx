'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamMembers, inviteTeamMember } from '@/lib/actions/user.actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Users, ShieldCheck, Mail, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { UserRole } from '@prisma/client';

type TeamMember = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
};

const inviteSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['SUPER_ADMIN', 'EDITOR', 'CLIENT']),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function TeamManagementPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: '', email: '', password: '', role: 'EDITOR' }
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    const res = await getTeamMembers();
    if (res.success && res.data) {
      setMembers(res.data as TeamMember[]);
    } else {
      toast.error(res.error || 'Failed to fetch team members');
    }
    setLoading(false);
  }

  async function onSubmit(data: InviteFormValues) {
    setIsSubmitting(true);
    
    const res = await inviteTeamMember(data);
    
    if (res.success) {
      toast.success('Team member added successfully!');
      setIsModalOpen(false);
      reset();
      fetchMembers();
      router.refresh();
    } else {
      toast.error(res.error || 'Failed to invite team member');
    }
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Team Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage admin access, editors, and clients</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        {member.name ? member.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{member.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      member.role === 'SUPER_ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      member.role === 'EDITOR' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {member.role === 'SUPER_ADMIN' && <ShieldCheck className="w-3 h-3" />}
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Invite Team Member</h3>
              <button onClick={() => { setIsModalOpen(false); reset(); }} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white`}
                  placeholder="Secure password"
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                <select
                  {...register('role')}
                  className={`w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border ${errors.role ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white`}
                >
                  <option value="EDITOR">Editor (CMS Access Only)</option>
                  <option value="SUPER_ADMIN">Super Admin (Full Access)</option>
                  <option value="CLIENT">Client</option>
                </select>
                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>}
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); reset(); }}
                  className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {isSubmitting ? 'Inviting...' : 'Invite Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
