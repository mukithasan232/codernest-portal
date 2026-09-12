'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  Star,
  Pencil,
  Trash2,
  CheckCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  MessageCircle,
  Mail,
  HelpCircle,
  Code2,
  Camera,
  Layers,
  Clock,
  Check,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { PricingPlan, ServiceCategory, PricingModelType } from '@/types';
import {
  getCmsEntries,
  createCmsEntry,
  updateCmsEntry,
  deleteCmsEntry,
  updatePricingPlansOrder
} from '@/lib/actions/cms.actions';

export default function UniversalPricingAdminPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ServiceCategory>('ALL');
  const [selectedModel, setSelectedModel] = useState<'ALL' | PricingModelType>('ALL');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    category: ServiceCategory;
    modelType: PricingModelType;
    title: string;
    priceDisplay: string;
    unitLabel: string;
    badge: string;
    isPopular: boolean;
    description: string;
    features: string[];
    minQuantity: string;
    ctaText: string;
    ctaAction: string;
    ctaLink: string;
    isActive: boolean;
  }>({
    category: 'SOFTWARE_DEV',
    modelType: 'FIXED_PACKAGE',
    title: '',
    priceDisplay: '',
    unitLabel: '/month',
    badge: '',
    isPopular: false,
    description: '',
    features: [''],
    minQuantity: '',
    ctaText: 'Get Started',
    ctaAction: 'contact',
    ctaLink: '/contact',
    isActive: true,
  });

  const fetchPlans = async () => {
    setLoading(true);
    const res = await getCmsEntries('pricing_plans');
    if (res.success && res.data) {
      setPlans(res.data as PricingPlan[]);
    } else {
      toast.error(res.error || 'Failed to fetch pricing plans');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      category: selectedCategory === 'ALL' ? 'SOFTWARE_DEV' : selectedCategory,
      modelType: selectedModel === 'ALL' ? 'FIXED_PACKAGE' : selectedModel,
      title: '',
      priceDisplay: '',
      unitLabel: selectedCategory === 'PHOTO_EDITING' ? '/per image' : '/month',
      badge: '',
      isPopular: false,
      description: '',
      features: ['24/7 dedicated support', 'High-speed delivery'],
      minQuantity: '',
      ctaText: 'Get Started',
      ctaAction: 'contact',
      ctaLink: '/contact',
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      category: plan.category || 'SOFTWARE_DEV',
      modelType: plan.modelType || 'FIXED_PACKAGE',
      title: plan.title || plan.name || '',
      priceDisplay: plan.priceDisplay || '',
      unitLabel: plan.unitLabel || plan.unit || '/month',
      badge: plan.badge || '',
      isPopular: !!plan.isPopular,
      description: plan.description || '',
      features: plan.features && plan.features.length > 0 ? [...plan.features] : [''],
      minQuantity: plan.minQuantity ? String(plan.minQuantity) : '',
      ctaText: plan.ctaText || 'Get Started',
      ctaAction: plan.ctaAction || 'contact',
      ctaLink: plan.ctaLink || '/contact',
      isActive: plan.isActive ?? true,
    });
    setModalOpen(true);
  };

  const handleTogglePopular = async (plan: PricingPlan) => {
    const updated = !plan.isPopular;
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isPopular: updated } : p));
    const res = await updateCmsEntry('pricing_plans', plan.id, { isPopular: updated });
    if (res.success) {
      toast.success(updated ? `Starred "${plan.title}" as Popular!` : `Unstarred "${plan.title}"`);
    } else {
      toast.error('Failed to update popular status');
      fetchPlans();
    }
  };

  const handleToggleActive = async (plan: PricingPlan) => {
    const updated = !plan.isActive;
    setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, isActive: updated } : p));
    const res = await updateCmsEntry('pricing_plans', plan.id, { isActive: updated });
    if (res.success) {
      toast.success(updated ? `Plan is now Live` : `Plan moved to Draft`);
    } else {
      toast.error('Failed to update status');
      fetchPlans();
    }
  };

  const handleDelete = async (plan: PricingPlan) => {
    if (!confirm(`Are you sure you want to delete "${plan.title || plan.name}"?`)) return;
    setPlans(prev => prev.filter(p => p.id !== plan.id));
    const res = await deleteCmsEntry('pricing_plans', plan.id);
    if (res.success) {
      toast.success('Plan deleted successfully');
    } else {
      toast.error('Failed to delete plan');
      fetchPlans();
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= plans.length) return;

    const reordered = [...plans];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const updatedWithOrder = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    setPlans(updatedWithOrder);

    const payload = updatedWithOrder.map(item => ({ id: item.id, order: item.order }));
    const res = await updatePricingPlansOrder(payload);
    if (!res.success) {
      toast.error('Failed to save plan order');
      fetchPlans();
    }
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...formData.features];
    updated[index] = val;
    setFormData(prev => ({ ...prev, features: updated }));
  };

  const handleAddFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const handleRemoveFeature = (index: number) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: updated.length ? updated : [''] }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.priceDisplay.trim()) {
      toast.error('Title and Price Display are required');
      return;
    }

    setSubmitting(true);
    const cleanFeatures = formData.features.map(f => f.trim()).filter(Boolean);

    const payload = {
      category: formData.category,
      modelType: formData.modelType,
      title: formData.title.trim(),
      name: formData.title.trim(), // backward compatibility
      priceDisplay: formData.priceDisplay.trim(),
      unitLabel: formData.unitLabel.trim(),
      unit: formData.unitLabel.trim(), // backward compatibility
      badge: formData.badge.trim() || null,
      isPopular: formData.isPopular,
      description: formData.description.trim() || null,
      features: cleanFeatures,
      minQuantity: formData.minQuantity ? parseInt(formData.minQuantity, 10) : null,
      ctaText: formData.ctaText.trim() || 'Get Started',
      ctaAction: formData.ctaAction,
      ctaLink: formData.ctaLink.trim() || '#contact',
      isActive: formData.isActive,
    };

    if (editingPlan) {
      const res = await updateCmsEntry('pricing_plans', editingPlan.id, payload);
      if (res.success) {
        toast.success('Plan updated successfully!');
        setModalOpen(false);
        fetchPlans();
      } else {
        toast.error(res.error || 'Failed to update plan');
      }
    } else {
      const res = await createCmsEntry('pricing_plans', {
        ...payload,
        order: plans.length + 1,
      });
      if (res.success) {
        toast.success('New plan created successfully!');
        setModalOpen(false);
        fetchPlans();
      } else {
        toast.error(res.error || 'Failed to create plan');
      }
    }
    setSubmitting(false);
  };

  // Filtered List
  const filteredPlans = plans.filter(p => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (selectedModel !== 'ALL' && p.modelType !== selectedModel) return false;
    return true;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Universal Pricing Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Dual-Mode CMS
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Manage unit-based rates (hourly, per-image) and fixed retainers for Software & Photo services.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-105 active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Pricing Plan</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 backdrop-blur-md">
        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Category:
          </span>
          {[
            { key: 'ALL', label: 'All Categories' },
            { key: 'SOFTWARE_DEV', label: 'Software & SaaS', icon: Code2 },
            { key: 'PHOTO_EDITING', label: 'Photo Editing', icon: Camera },
          ].map(tab => {
            const Icon = tab.icon;
            const active = selectedCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedCategory(tab.key as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-cyan-500 text-zinc-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Model Type Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Model:
          </span>
          {[
            { key: 'ALL', label: 'All Models' },
            { key: 'UNIT_BASED', label: 'Unit-Based (Pay-As-You-Go)', icon: Clock },
            { key: 'FIXED_PACKAGE', label: 'Fixed / Retainers', icon: Layers },
          ].map(tab => {
            const Icon = tab.icon;
            const active = selectedModel === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedModel(tab.key as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  active
                    ? 'bg-blue-600 text-white shadow-md font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 animate-pulse">
          Loading universal pricing plans...
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800">
          <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-300 font-bold">No pricing plans found for this selection.</p>
          <button
            onClick={openCreateModal}
            className="mt-4 text-xs font-semibold px-4 py-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20"
          >
            Create Plan
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table (Tablet / Desktop) */}
          <div className="hidden md:block overflow-hidden rounded-2xl bg-zinc-950/70 border border-zinc-800 shadow-xl backdrop-blur-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-zinc-900/90 text-xs uppercase font-extrabold tracking-wider text-slate-400 border-b border-zinc-800">
                  <tr>
                    <th className="py-4 px-4 w-12 text-center">Order</th>
                    <th className="py-4 px-4 w-10 text-center">⭐</th>
                    <th className="py-4 px-5">Plan Title</th>
                    <th className="py-4 px-4">Category</th>
                    <th className="py-4 px-4">Billing Model</th>
                    <th className="py-4 px-4">Price / Unit</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredPlans.map((plan, index) => (
                    <tr
                      key={plan.id}
                      className={`hover:bg-zinc-900/40 transition-colors ${
                        plan.isPopular ? 'bg-cyan-950/10' : ''
                      }`}
                    >
                      {/* Order Controls */}
                      <td className="py-4 px-2 text-center">
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => handleMoveOrder(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-bold text-slate-400">{index + 1}</span>
                          <button
                            onClick={() => handleMoveOrder(index, 'down')}
                            disabled={index === filteredPlans.length - 1}
                            className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Star (Popular) Toggle */}
                      <td className="py-4 px-2 text-center">
                        <button
                          onClick={() => handleTogglePopular(plan)}
                          title={plan.isPopular ? 'Popular Plan (Click to unstar)' : 'Click to feature as Popular'}
                          className="p-1.5 rounded-lg hover:bg-white/5 transition-transform active:scale-90"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              plan.isPopular
                                ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]'
                                : 'text-slate-600 hover:text-slate-400'
                            }`}
                          />
                        </button>
                      </td>

                      {/* Title & Badge */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">
                            {plan.title || plan.name}
                          </span>
                          {plan.badge && (
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        {plan.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {plan.description}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            plan.category === 'SOFTWARE_DEV'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {plan.category === 'SOFTWARE_DEV' ? <Code2 className="w-3 h-3" /> : <Camera className="w-3 h-3" />}
                          {plan.category === 'SOFTWARE_DEV' ? 'Software & SaaS' : 'Photo Editing'}
                        </span>
                      </td>

                      {/* Model */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            plan.modelType === 'UNIT_BASED'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {plan.modelType === 'UNIT_BASED' ? (
                            <>
                              <Clock className="w-3 h-3" /> Unit-Based
                            </>
                          ) : (
                            <>
                              <Layers className="w-3 h-3" /> Fixed Package
                            </>
                          )}
                        </span>
                        {plan.minQuantity ? (
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Min: {plan.minQuantity} units
                          </div>
                        ) : null}
                      </td>

                      {/* Price / Unit */}
                      <td className="py-4 px-4">
                        <div className="flex items-baseline gap-1 font-mono">
                          <span className="text-base font-extrabold text-white">
                            {plan.priceDisplay}
                          </span>
                          <span className="text-xs text-slate-400">
                            {plan.unitLabel || plan.unit}
                          </span>
                        </div>
                      </td>

                      {/* Active Status */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(plan)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            plan.isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-zinc-800 text-slate-500 border border-zinc-700'
                          }`}
                        >
                          {plan.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {plan.isActive ? 'Live' : 'Draft'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(plan)}
                            className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-slate-300 hover:text-white transition"
                            title="Edit Plan"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(plan)}
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                            title="Delete Plan"
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

          {/* Mobile Card Layout (Phone Screens < 768px) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredPlans.map((plan, index) => (
              <div
                key={plan.id}
                className={`p-5 rounded-2xl bg-zinc-950/80 border transition-all ${
                  plan.isPopular ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base">
                        {plan.title || plan.name}
                      </h3>
                      {plan.badge && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-1 font-mono">
                      <span className="text-xl font-black text-cyan-400">{plan.priceDisplay}</span>
                      <span className="text-xs text-slate-400">{plan.unitLabel || plan.unit}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTogglePopular(plan)}
                    className="p-2 rounded-xl bg-white/5"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        plan.isPopular ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'
                      }`}
                    />
                  </button>
                </div>

                {plan.description && (
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                    {plan.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-zinc-800/80 text-xs">
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-slate-300">
                    {plan.category === 'SOFTWARE_DEV' ? 'Software & SaaS' : 'Photo Editing'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-slate-300">
                    {plan.modelType === 'UNIT_BASED' ? 'Unit-Based' : 'Fixed Package'}
                  </span>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`px-2 py-0.5 rounded font-bold ${
                      plan.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-slate-500'
                    }`}
                  >
                    {plan.isActive ? '● Live' : '○ Draft'}
                  </button>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-800/80">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 text-xs font-semibold text-white flex items-center gap-1.5"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(plan)}
                    className="px-3 py-1.5 rounded-xl bg-red-500/10 text-xs font-semibold text-red-400 flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {editingPlan ? 'Edit Pricing Plan' : 'Create New Pricing Plan'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Configure rate, category, model, and interactive live card preview.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Form + Live Preview */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left 7 cols: Form Controls */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Category & Model Switcher */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={e => {
                          const cat = e.target.value as ServiceCategory;
                          setFormData(prev => ({
                            ...prev,
                            category: cat,
                            unitLabel: cat === 'PHOTO_EDITING' ? '/per image' : '/month',
                          }));
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="SOFTWARE_DEV">Software & SaaS</option>
                        <option value="PHOTO_EDITING">Photo Editing</option>
                        <option value="CUSTOM">Custom / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Billing Model Type *
                      </label>
                      <select
                        value={formData.modelType}
                        onChange={e => {
                          const model = e.target.value as PricingModelType;
                          setFormData(prev => ({
                            ...prev,
                            modelType: model,
                            unitLabel: model === 'UNIT_BASED'
                              ? (prev.category === 'PHOTO_EDITING' ? '/per image' : '/hour')
                              : (prev.category === 'PHOTO_EDITING' ? '/per image' : '/month'),
                          }));
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="UNIT_BASED">Unit / Usage-Based (Per Image / Hour)</option>
                        <option value="FIXED_PACKAGE">Fixed / Monthly Package (Retainer / Milestone)</option>
                      </select>
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Plan Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        placeholder={formData.category === 'PHOTO_EDITING' ? 'e.g., Clipping Path' : 'e.g., Dedicated Senior Engineer'}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Badge (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={e => setFormData({ ...formData, badge: e.target.value })}
                        placeholder="e.g., Most Popular, Best Value"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Price & Unit */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Price Display *
                      </label>
                      <input
                        type="text"
                        value={formData.priceDisplay}
                        onChange={e => setFormData({ ...formData, priceDisplay: e.target.value })}
                        placeholder="e.g., $0.20, $40, $4,500, $1-$3"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        Unit Label *
                      </label>
                      <input
                        type="text"
                        value={formData.unitLabel}
                        onChange={e => setFormData({ ...formData, unitLabel: e.target.value })}
                        placeholder="e.g., /per image, /hour, /month"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Min Quantity (Only for Unit-Based) */}
                  {formData.modelType === 'UNIT_BASED' && (
                    <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-800/40">
                      <label className="block text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">
                        Minimum Unit Quantity (Optional)
                      </label>
                      <input
                        type="number"
                        value={formData.minQuantity}
                        onChange={e => setFormData({ ...formData, minQuantity: e.target.value })}
                        placeholder="e.g., 50 (min images) or 10 (min hours)"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                      />
                      <p className="text-[11px] text-purple-400/80 mt-1">
                        Used for interactive quantity sliders and batch thresholds.
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                      Short Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief summary of what this tier provides..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Dynamic Feature Bullets */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                        Feature Bullet Points
                      </label>
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Point
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={e => handleFeatureChange(idx, e.target.value)}
                            placeholder={`Feature #${idx + 1}`}
                            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-white focus:border-cyan-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(idx)}
                            className="p-2 text-slate-500 hover:text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Text & Action */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        CTA Action
                      </label>
                      <select
                        value={formData.ctaAction}
                        onChange={e => {
                          const action = e.target.value;
                          setFormData(prev => ({
                            ...prev,
                            ctaAction: action,
                            ctaLink: action === 'whatsapp' ? 'https://wa.me/8801749616724' : (action === 'checkout' ? '/api/checkout' : '/contact'),
                            ctaText: action === 'whatsapp' ? 'WhatsApp Now' : (action === 'checkout' ? 'Instant Checkout' : prev.ctaText)
                          }));
                        }}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="contact">Contact Form / Email</option>
                        <option value="whatsapp">WhatsApp Direct</option>
                        <option value="checkout">Checkout Link</option>
                      </select>
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        CTA Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.ctaText}
                        onChange={e => setFormData({ ...formData, ctaText: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1">
                      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                        CTA Target URL
                      </label>
                      <input
                        type="text"
                        value={formData.ctaLink}
                        onChange={e => setFormData({ ...formData, ctaLink: e.target.value })}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-800">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPopular}
                        onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                        className="w-4 h-4 rounded text-cyan-500 accent-cyan-500"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          Feature as Popular
                        </div>
                        <div className="text-slate-500">Adds glowing cyan highlight</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                      />
                      <div className="text-xs">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          Publish / Live Status
                        </div>
                        <div className="text-slate-500">Visible on public pricing pages</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Right 5 cols: Live Card Preview */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    Live Frontend Card Preview
                  </div>

                  <div
                    className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                      formData.isPopular
                        ? 'bg-zinc-900/90 border-2 border-cyan-400 shadow-[0_0_35px_rgba(6,182,212,0.3)]'
                        : 'bg-zinc-900/60 border border-zinc-800'
                    }`}
                  >
                    {/* Badge */}
                    {formData.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full text-[10px] font-black uppercase tracking-wider text-zinc-950 shadow-md">
                        {formData.badge}
                      </div>
                    )}

                    <div>
                      <h4 className="text-xl font-bold text-white text-center mt-2">
                        {formData.title || 'Plan Name Here'}
                      </h4>

                      <div className="mt-5 mb-6 text-center flex items-baseline justify-center gap-1 font-mono">
                        <span className={`text-4xl font-black ${formData.isPopular ? 'text-cyan-400' : 'text-blue-400'}`}>
                          {formData.priceDisplay || '$0.00'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formData.unitLabel || '/month'}
                        </span>
                      </div>

                      {formData.description && (
                        <p className="text-xs text-slate-400 text-center mb-4">
                          {formData.description}
                        </p>
                      )}

                      {formData.modelType === 'UNIT_BASED' && formData.minQuantity && (
                        <div className="text-center mb-4">
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                            Min Order: {formData.minQuantity} units
                          </span>
                        </div>
                      )}

                      <div className="space-y-2.5 pt-4 border-t border-zinc-800 text-xs">
                        {formData.features.filter(Boolean).map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-cyan-500/15 text-cyan-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                            <span className="text-slate-300 leading-snug">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4">
                      <div
                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
                          formData.isPopular
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-zinc-950 shadow-md'
                            : formData.ctaAction === 'whatsapp'
                            ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-blue-600/20 text-blue-300 border border-blue-500/40'
                        }`}
                      >
                        {formData.ctaAction === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5" />}
                        {formData.ctaText || 'Get Started'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 z-20 bg-zinc-950/95 backdrop-blur-md px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-zinc-800 text-slate-300 hover:bg-zinc-900 font-semibold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] transition disabled:opacity-50"
              >
                {submitting ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
