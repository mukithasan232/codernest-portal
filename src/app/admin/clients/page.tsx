'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getClients, inviteTeamMember } from '@/lib/actions/user.actions';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  UserCheck, Mail, Plus, X, Search,
  Calendar, User, TrendingUp, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

type Client = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
};

const addClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.literal('CLIENT'),
});

type AddClientFormValues = z.infer<typeof addClientSchema>;

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function ClientManagementPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddClientFormValues>({
    resolver: zodResolver(addClientSchema),
    defaultValues: { name: '', email: '', password: '', role: 'CLIENT' }
  });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    const res = await getClients();
    if (res.success && res.data) {
      setClients(res.data as Client[]);
    } else {
      toast.error(res.error || 'Failed to fetch clients');
    }
    setLoading(false);
  }

  async function onSubmit(data: AddClientFormValues) {
    setIsSubmitting(true);
    const res = await inviteTeamMember(data);
    if (res.success) {
      toast.success('Client added successfully!');
      setIsModalOpen(false);
      reset();
      fetchClients();
      router.refresh();
    } else {
      toast.error(res.error || 'Failed to add client');
    }
    setIsSubmitting(false);
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter(c =>
      (c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
    );
  }, [clients, search]);

  const thisMonthCount = clients.filter(c => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-emerald-500" />
            Client Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all external client accounts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={clients.length}
          color="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          icon={TrendingUp}
          label="Joined This Month"
          value={thisMonthCount}
          color="bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={User}
          label="Avg. per Month"
          value={clients.length > 0
            ? Math.round(clients.length / Math.max(1, Math.ceil((Date.now() - new Date(clients[clients.length - 1]?.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))))
            : 0
          }
          color="bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search clients by name or email…"
          className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl w-full" />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Joined
                  </span>
                </th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/10">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {client.name ? client.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {client.name || 'Unknown'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                      {client.email}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {new Date(client.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <UserCheck className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">
                      {search ? 'No clients match your search.' : 'No clients yet.'}
                    </p>
                    {!search && (
                      <button
                        onClick={() => setIsModalOpen(true)}
                        className="mt-3 text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
                      >
                        Add your first client →
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-emerald-50 dark:bg-emerald-600/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Add New Client</h3>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); reset(); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register('name')}
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border ${errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all`}
                  placeholder="Jane Smith"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border ${errors.email ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all`}
                  placeholder="jane@company.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password
                </label>
                <input
                  type="password"
                  {...register('password')}
                  className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900 dark:text-white transition-all`}
                  placeholder="Secure password"
                />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              {/* Hidden role field */}
              <input type="hidden" {...register('role')} value="CLIENT" />

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); reset(); }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-sm"
                >
                  {isSubmitting && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {isSubmitting ? 'Adding…' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
