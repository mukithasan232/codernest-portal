'use client';

import { useState, useEffect } from 'react';
import {
  Scissors,
  Crop,
  Sparkles,
  Layers,
  Camera,
  Image as ImageIcon,
  Wand2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  X,
  ArrowRight,
  Sliders
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { PhotoService, BeforeAfterShowcase } from '@/types';
import {
  getCmsEntries,
  createCmsEntry,
  updateCmsEntry,
  deleteCmsEntry,
  updatePhotoServicesOrder
} from '@/lib/actions/cms.actions';
import BeforeAfterSlider from '@/components/ui/BeforeAfterSlider';

export default function PhotoServicesAdminPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'showcase'>('services');

  // Services State
  const [services, setServices] = useState<PhotoService[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<PhotoService | null>(null);
  const [submittingService, setSubmittingService] = useState(false);

  const [serviceForm, setServiceForm] = useState<{
    title: string;
    slug: string;
    description: string;
    iconName: string;
    imageUrl: string;
    features: string[];
    isActive: boolean;
  }>({
    title: '',
    slug: '',
    description: '',
    iconName: 'Scissors',
    imageUrl: '/dummy-laptop.png',
    features: ['100% Hand-Drawn Pen Tool Paths', 'Bulk Discounts on 400+ Images'],
    isActive: true,
  });

  // Showcase State
  const [showcases, setShowcases] = useState<BeforeAfterShowcase[]>([]);
  const [loadingShowcases, setLoadingShowcases] = useState(true);
  const [showcaseModalOpen, setShowcaseModalOpen] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<BeforeAfterShowcase | null>(null);
  const [submittingShowcase, setSubmittingShowcase] = useState(false);

  const [showcaseForm, setShowcaseForm] = useState<{
    title: string;
    category: string;
    beforeImage: string;
    afterImage: string;
    isActive: boolean;
  }>({
    title: '',
    category: 'Clipping Path',
    beforeImage: '',
    afterImage: '',
    isActive: true,
  });

  // Fetch Services
  const fetchServices = async () => {
    setLoadingServices(true);
    const res = await getCmsEntries('photo_services');
    if (res.success && res.data) {
      setServices(res.data as PhotoService[]);
    }
    setLoadingServices(false);
  };

  // Fetch Showcases
  const fetchShowcases = async () => {
    setLoadingShowcases(true);
    const res = await getCmsEntries('before_after_showcase');
    if (res.success && res.data) {
      setShowcases(res.data as BeforeAfterShowcase[]);
    }
    setLoadingShowcases(false);
  };

  useEffect(() => {
    fetchServices();
    fetchShowcases();
  }, []);

  // ── Services Handlers ───────────────────────────────────────────────────────
  const openCreateServiceModal = () => {
    setEditingService(null);
    setServiceForm({
      title: '',
      slug: '',
      description: '',
      iconName: 'Scissors',
      imageUrl: '/dummy-laptop.png',
      features: ['100% Hand-Drawn Pen Tool Paths', '24-hour turnaround'],
      isActive: true,
    });
    setServiceModalOpen(true);
  };

  const openEditServiceModal = (svc: PhotoService) => {
    setEditingService(svc);
    setServiceForm({
      title: svc.title,
      slug: svc.slug,
      description: svc.description,
      iconName: svc.iconName || 'Scissors',
      imageUrl: svc.imageUrl || '/dummy-laptop.png',
      features: svc.features && svc.features.length > 0 ? [...svc.features] : [''],
      isActive: svc.isActive,
    });
    setServiceModalOpen(true);
  };

  const handleToggleServiceActive = async (svc: PhotoService) => {
    const updated = !svc.isActive;
    setServices(prev => prev.map(s => s.id === svc.id ? { ...s, isActive: updated } : s));
    const res = await updateCmsEntry('photo_services', svc.id, { isActive: updated });
    if (res.success) {
      toast.success(updated ? 'Service is now Live' : 'Service moved to Draft');
    } else {
      toast.error('Failed to update status');
      fetchServices();
    }
  };

  const handleDeleteService = async (svc: PhotoService) => {
    if (!confirm(`Are you sure you want to delete service "${svc.title}"?`)) return;
    setServices(prev => prev.filter(s => s.id !== svc.id));
    const res = await deleteCmsEntry('photo_services', svc.id);
    if (res.success) {
      toast.success('Service deleted successfully');
    } else {
      toast.error('Failed to delete service');
      fetchServices();
    }
  };

  const handleMoveServiceOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    const reordered = [...services];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updatedWithOrder = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setServices(updatedWithOrder);

    const payload = updatedWithOrder.map(item => ({ id: item.id, order: item.order }));
    const res = await updatePhotoServicesOrder(payload);
    if (!res.success) {
      toast.error('Failed to save order');
      fetchServices();
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceForm.title.trim()) {
      toast.error('Service title is required');
      return;
    }

    setSubmittingService(true);
    const slug = serviceForm.slug.trim() || serviceForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cleanFeatures = serviceForm.features.map(f => f.trim()).filter(Boolean);

    const payload = {
      title: serviceForm.title.trim(),
      slug,
      description: serviceForm.description.trim(),
      iconName: serviceForm.iconName,
      imageUrl: serviceForm.imageUrl.trim() || '/dummy-laptop.png',
      features: cleanFeatures,
      isActive: serviceForm.isActive,
    };

    if (editingService) {
      const res = await updateCmsEntry('photo_services', editingService.id, payload);
      if (res.success) {
        toast.success('Service updated successfully!');
        setServiceModalOpen(false);
        fetchServices();
      } else {
        toast.error(res.error || 'Failed to update service');
      }
    } else {
      const res = await createCmsEntry('photo_services', {
        ...payload,
        order: services.length + 1,
      });
      if (res.success) {
        toast.success('Service created successfully!');
        setServiceModalOpen(false);
        fetchServices();
      } else {
        toast.error(res.error || 'Failed to create service');
      }
    }
    setSubmittingService(false);
  };

  // ── Showcase Handlers ──────────────────────────────────────────────────────
  const openCreateShowcaseModal = () => {
    setEditingShowcase(null);
    setShowcaseForm({
      title: '',
      category: 'Clipping Path',
      beforeImage: '/uploads/media/1788382703903-412306699-Screenshot2026-09-03at2.58.20AM.png',
      afterImage: '/uploads/media/1788382734277-944822245-Screenshot2026-09-03at2.58.50AM.png',
      isActive: true,
    });
    setShowcaseModalOpen(true);
  };

  const openEditShowcaseModal = (sc: BeforeAfterShowcase) => {
    setEditingShowcase(sc);
    setShowcaseForm({
      title: sc.title,
      category: sc.category,
      beforeImage: sc.beforeImage,
      afterImage: sc.afterImage,
      isActive: sc.isActive,
    });
    setShowcaseModalOpen(true);
  };

  const handleToggleShowcaseActive = async (sc: BeforeAfterShowcase) => {
    const updated = !sc.isActive;
    setShowcases(prev => prev.map(s => s.id === sc.id ? { ...s, isActive: updated } : s));
    const res = await updateCmsEntry('before_after_showcase', sc.id, { isActive: updated });
    if (res.success) {
      toast.success(updated ? 'Showcase is Live' : 'Showcase hidden');
    } else {
      toast.error('Failed to update status');
      fetchShowcases();
    }
  };

  const handleDeleteShowcase = async (sc: BeforeAfterShowcase) => {
    if (!confirm(`Delete showcase "${sc.title}"?`)) return;
    setShowcases(prev => prev.filter(s => s.id !== sc.id));
    const res = await deleteCmsEntry('before_after_showcase', sc.id);
    if (res.success) {
      toast.success('Showcase removed');
    } else {
      toast.error('Failed to delete showcase');
      fetchShowcases();
    }
  };

  const handleSaveShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseForm.title.trim() || !showcaseForm.beforeImage.trim() || !showcaseForm.afterImage.trim()) {
      toast.error('Title, Before Image, and After Image are required');
      return;
    }

    setSubmittingShowcase(true);
    const payload = {
      title: showcaseForm.title.trim(),
      category: showcaseForm.category.trim(),
      beforeImage: showcaseForm.beforeImage.trim(),
      afterImage: showcaseForm.afterImage.trim(),
      isActive: showcaseForm.isActive,
    };

    if (editingShowcase) {
      const res = await updateCmsEntry('before_after_showcase', editingShowcase.id, payload);
      if (res.success) {
        toast.success('Showcase slider updated!');
        setShowcaseModalOpen(false);
        fetchShowcases();
      } else {
        toast.error(res.error || 'Failed to update showcase');
      }
    } else {
      const res = await createCmsEntry('before_after_showcase', {
        ...payload,
        order: showcases.length + 1,
      });
      if (res.success) {
        toast.success('Showcase slider added!');
        setShowcaseModalOpen(false);
        fetchShowcases();
      } else {
        toast.error(res.error || 'Failed to add showcase');
      }
    }
    setSubmittingShowcase(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Photo Editing CMS
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Services & Showcases
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Manage ClippingBD-inspired photo editing services, features, and interactive Before/After sliders.
          </p>
        </div>

        {activeTab === 'services' ? (
          <button
            onClick={openCreateServiceModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Service</span>
          </button>
        ) : (
          <button
            onClick={openCreateShowcaseModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Showcase Slider</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/60 border border-zinc-800 w-fit backdrop-blur-md">
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'services'
              ? 'bg-cyan-500 text-zinc-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Scissors className="w-4 h-4" />
          <span>Services Manager ({services.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('showcase')}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'showcase'
              ? 'bg-cyan-500 text-zinc-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Before / After Showcases ({showcases.length})</span>
        </button>
      </div>

      {/* TAB 1: SERVICES MANAGER */}
      {activeTab === 'services' && (
        <>
          {loadingServices ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">
              Loading photo editing services...
            </div>
          ) : services.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <Scissors className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-bold">No photo services found.</p>
              <button
                onClick={openCreateServiceModal}
                className="mt-4 text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              >
                Create Service
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl bg-zinc-950/70 border border-zinc-800 shadow-xl backdrop-blur-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-zinc-900/90 text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-zinc-800">
                    <tr>
                      <th className="py-4 px-3 w-12 text-center">Order</th>
                      <th className="py-4 px-5">Service Title & Slug</th>
                      <th className="py-4 px-4">Features</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {services.map((svc, index) => (
                      <tr key={svc.id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-4 px-2 text-center">
                          <div className="flex flex-col items-center">
                            <button
                              onClick={() => handleMoveServiceOrder(index, 'up')}
                              disabled={index === 0}
                              className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] font-bold text-slate-400">{index + 1}</span>
                            <button
                              onClick={() => handleMoveServiceOrder(index, 'down')}
                              disabled={index === services.length - 1}
                              className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        <td className="py-4 px-5">
                          <div>
                            <span className="font-bold text-white text-base">
                              {svc.title}
                            </span>
                            <span className="block text-xs font-mono text-cyan-400/80 mt-0.5">
                              /{svc.slug}
                            </span>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-1">
                              {svc.description}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-slate-300 font-semibold">
                            {svc.features?.length || 0} features
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleServiceActive(svc)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                              svc.isActive
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-zinc-800 text-slate-500 border border-zinc-700'
                            }`}
                          >
                            {svc.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            {svc.isActive ? 'Live' : 'Draft'}
                          </button>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => openEditServiceModal(svc)}
                              className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 hover:text-white transition"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(svc)}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: SHOWCASE MANAGER */}
      {activeTab === 'showcase' && (
        <>
          {loadingShowcases ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">
              Loading Before/After sliders...
            </div>
          ) : showcases.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
              <Sliders className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-bold">No Before/After sliders added yet.</p>
              <button
                onClick={openCreateShowcaseModal}
                className="mt-4 text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
              >
                Add Showcase Slider
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showcases.map((sc) => (
                <div
                  key={sc.id}
                  className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white text-base truncate">
                        {sc.title}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {sc.category}
                      </span>
                    </div>

                    <BeforeAfterSlider
                      beforeImage={sc.beforeImage}
                      afterImage={sc.afterImage}
                      altText={sc.title}
                      className="rounded-xl border border-zinc-800"
                    />
                  </div>

                  <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => handleToggleShowcaseActive(sc)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        sc.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-slate-500'
                      }`}
                    >
                      {sc.isActive ? '● Live' : '○ Hidden'}
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditShowcaseModal(sc)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-slate-300"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteShowcase(sc)}
                        className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* SERVICE EDIT/CREATE MODAL */}
      {serviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingService ? 'Edit Photo Service' : 'Add New Photo Service'}
              </h2>
              <button
                onClick={() => setServiceModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.title}
                    onChange={e => setServiceForm({
                      ...serviceForm,
                      title: e.target.value,
                      slug: editingService ? serviceForm.slug : e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                    })}
                    placeholder="e.g., Clipping Path"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={serviceForm.slug}
                    onChange={e => setServiceForm({ ...serviceForm, slug: e.target.value })}
                    placeholder="e.g., clipping-path"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Detailed description of the service..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Icon Name
                  </label>
                  <select
                    value={serviceForm.iconName}
                    onChange={e => setServiceForm({ ...serviceForm, iconName: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Scissors">Scissors (Clipping Path)</option>
                    <option value="Crop">Crop (Cutout)</option>
                    <option value="Sparkles">Sparkles (Retouching)</option>
                    <option value="Layers">Layers (Background Removal)</option>
                    <option value="Camera">Camera (Ghost Mannequin)</option>
                    <option value="Wand2">Wand2 (AI / Vector Mask)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={serviceForm.imageUrl}
                    onChange={e => setServiceForm({ ...serviceForm, imageUrl: e.target.value })}
                    placeholder="/dummy-laptop.png"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Feature Bullet Points
                  </label>
                  <button
                    type="button"
                    onClick={() => setServiceForm({ ...serviceForm, features: [...serviceForm.features, ''] })}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Point
                  </button>
                </div>
                <div className="space-y-2">
                  {serviceForm.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={feat}
                        onChange={e => {
                          const updated = [...serviceForm.features];
                          updated[idx] = e.target.value;
                          setServiceForm({ ...serviceForm, features: updated });
                        }}
                        placeholder={`Feature #${idx + 1}`}
                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = serviceForm.features.filter((_, i) => i !== idx);
                          setServiceForm({ ...serviceForm, features: updated.length ? updated : [''] });
                        }}
                        className="p-2 text-slate-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 z-20 bg-zinc-950/95 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-slate-300 hover:bg-zinc-900 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingService}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-sm shadow-md"
                >
                  {submittingService ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SHOWCASE EDIT/CREATE MODAL */}
      {showcaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingShowcase ? 'Edit Showcase Slider' : 'Add Showcase Slider'}
              </h2>
              <button
                onClick={() => setShowcaseModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShowcase} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Showcase Title *
                  </label>
                  <input
                    type="text"
                    value={showcaseForm.title}
                    onChange={e => setShowcaseForm({ ...showcaseForm, title: e.target.value })}
                    placeholder="e.g., Jewelry Clipping"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Category *
                  </label>
                  <input
                    type="text"
                    value={showcaseForm.category}
                    onChange={e => setShowcaseForm({ ...showcaseForm, category: e.target.value })}
                    placeholder="e.g., Clipping Path, Ghost Mannequin"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    Before Image URL *
                  </label>
                  <input
                    type="text"
                    value={showcaseForm.beforeImage}
                    onChange={e => setShowcaseForm({ ...showcaseForm, beforeImage: e.target.value })}
                    placeholder="/uploads/media/... or https://..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                    After Image URL *
                  </label>
                  <input
                    type="text"
                    value={showcaseForm.afterImage}
                    onChange={e => setShowcaseForm({ ...showcaseForm, afterImage: e.target.value })}
                    placeholder="/uploads/media/... or https://..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono text-xs"
                    required
                  />
                </div>
              </div>

              {/* Live Interactive Preview */}
              {showcaseForm.beforeImage && showcaseForm.afterImage && (
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Live Slider Preview
                  </div>
                  <BeforeAfterSlider
                    beforeImage={showcaseForm.beforeImage}
                    afterImage={showcaseForm.afterImage}
                    altText={showcaseForm.title || 'Preview'}
                    className="rounded-xl border border-zinc-800"
                  />
                </div>
              )}

              <div className="sticky bottom-0 z-20 bg-zinc-950/95 pt-4 border-t border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowcaseModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-zinc-800 text-slate-300 hover:bg-zinc-900 font-semibold text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingShowcase}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-sm shadow-md"
                >
                  {submittingShowcase ? 'Saving...' : editingShowcase ? 'Save Changes' : 'Create Slider'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
