'use client';

import { useState, useEffect } from 'react';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember, updateCompanyStats } from '@/lib/actions/team.actions';
import { getGlobalSettings } from '@/lib/actions/settings.actions';
import { TeamMember } from '@/types';
import { Users, Plus, Edit2, Trash2, X, Loader2, Save, Target, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploader from '@/components/ui/ImageUploader';

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState({ foundedYear: '2023', totalClients: 50, totalProjects: 120 });
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingStats, setIsSavingStats] = useState(false);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    department: 'Engineering',
    bio: '',
    imageUrl: '',
    order: 0,
    isActive: true
  });

  const fetchInitialData = async () => {
    setIsLoading(true);
    const [teamRes, settingsRes] = await Promise.all([
      getTeamMembers(),
      getGlobalSettings()
    ]);
    
    if (teamRes.success && teamRes.data) {
      setMembers(teamRes.data);
    }
    
    if (settingsRes.success && settingsRes.data) {
      setStats({
        foundedYear: settingsRes.data.foundedYear || '2023',
        totalClients: settingsRes.data.totalClients || 50,
        totalProjects: settingsRes.data.totalProjects || 120
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleSaveStats = async () => {
    setIsSavingStats(true);
    const res = await updateCompanyStats(stats);
    if (res.success) {
      toast.success('Company stats updated!');
    } else {
      toast.error('Failed to update stats');
    }
    setIsSavingStats(false);
  };

  const openModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        designation: member.designation,
        department: member.department,
        bio: member.bio || '',
        imageUrl: member.imageUrl,
        order: member.order,
        isActive: member.isActive
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        designation: '',
        department: 'Engineering',
        bio: '',
        imageUrl: '',
        order: members.length,
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toast.error('Please upload a profile image');
      return;
    }

    setIsSaving(true);
    
    const res = editingMember 
      ? await updateTeamMember(editingMember.id, formData)
      : await createTeamMember(formData);

    if (res.success) {
      toast.success(editingMember ? 'Member updated!' : 'Member added!');
      setIsModalOpen(false);
      fetchInitialData();
    } else {
      toast.error(res.error || 'Operation failed');
    }
    
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    const toastId = toast.loading('Deleting...');
    const res = await deleteTeamMember(id);
    if (res.success) {
      toast.success('Member removed', { id: toastId });
      fetchInitialData();
    } else {
      toast.error('Failed to delete', { id: toastId });
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    const res = await updateTeamMember(member.id, { isActive: !member.isActive });
    if (res.success) {
      toast.success(`Member marked as ${!member.isActive ? 'Active' : 'Inactive'}`);
      setMembers(members.map(m => m.id === member.id ? { ...m, isActive: !member.isActive } : m));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Team Management</h1>
          <p className="text-slate-400 mt-1">Manage company stats and team profiles for the About Us page.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Company Stats Section */}
      <div className="glass rounded-3xl border border-white/10 p-8 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-white">Company Statistics</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs text-slate-400 mb-2">Founded Year</label>
            <input 
              type="text" 
              value={stats.foundedYear}
              onChange={e => setStats({...stats, foundedYear: e.target.value})}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Total Clients</label>
            <input 
              type="number" 
              value={stats.totalClients}
              onChange={e => setStats({...stats, totalClients: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-2">Total Projects</label>
            <input 
              type="number" 
              value={stats.totalProjects}
              onChange={e => setStats({...stats, totalProjects: parseInt(e.target.value) || 0})}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSaveStats}
            disabled={isSavingStats}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-all disabled:opacity-50"
          >
            {isSavingStats ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Stats
          </button>
        </div>
      </div>

      {/* Team Members List */}
      <div className="glass rounded-3xl border border-white/10 overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No team members added yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Role & Dept</th>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {members.map(member => (
                <tr key={member.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden border border-white/10 bg-slate-800">
                        {member.imageUrl ? (
                          <img src={member.imageUrl} alt={member.name} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">
                            {member.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{member.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[150px]">{member.bio || 'No bio'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-300">{member.designation}</div>
                    <div className="text-xs text-blue-400">{member.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-800 px-3 py-1 rounded-lg text-slate-300 font-mono text-xs">{member.order}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggleActive(member)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${member.isActive ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20'}`}
                    >
                      {member.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {member.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => openModal(member)}
                      className="p-2 text-slate-400 hover:text-blue-400 bg-white/5 hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 bg-slate-900/95 backdrop-blur-md z-10">
              <h2 className="text-xl font-bold text-white">{editingMember ? 'Edit Member' : 'Add Team Member'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-1/3">
                  <label className="block text-xs text-slate-400 mb-2">Profile Photo *</label>
                  <div className="aspect-square w-full rounded-2xl overflow-hidden border-2 border-dashed border-white/10 hover:border-blue-500/50 transition-colors">
                    <ImageUploader
                      userId="admin"
                      onUploadComplete={(url) => setFormData({...formData, imageUrl: url})}
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-2/3 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Designation *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. CTO"
                        value={formData.designation}
                        onChange={e => setFormData({...formData, designation: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Department *</label>
                      <select 
                        required
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                      >
                        <option value="Management">Management</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Operations">Operations</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Short Bio</label>
                <textarea 
                  rows={3}
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Brief description of their role and experience..."
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Display Order</label>
                  <input 
                    type="number" 
                    value={formData.order}
                    onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Lower numbers appear first (e.g. 0, 1, 2)</p>
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-5 h-5 rounded text-blue-600 bg-white/5 border-white/10 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <span className="text-sm font-medium text-slate-300">Active / Visible on site</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-slate-300 font-semibold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isSaving ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
