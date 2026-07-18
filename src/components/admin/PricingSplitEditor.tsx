'use client';

import { useState, useEffect } from 'react';
import type { ServicePricing } from '@/types';
import { X, Save, Plus, GripVertical, Code, LayoutTemplate, Trash2 } from 'lucide-react';
import PricingCard from '@/components/marketing/PricingCard';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableFeatureItem({ id, feature, onEdit, onRemove }: { id: string, feature: string, onEdit: (val: string) => void, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-2 mb-2 group">
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-slate-500 hover:text-slate-900 dark:text-white transition">
        <GripVertical className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={feature}
        onChange={(e) => onEdit(e.target.value)}
        className="flex-1 bg-transparent border-none text-slate-900 dark:text-white text-sm focus:outline-none"
        placeholder="Enter feature..."
      />
      <button onClick={onRemove} className="p-1 text-slate-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function PricingSplitEditor({ 
  initialData, 
  onSave, 
  onCancel 
}: { 
  initialData: ServicePricing | null, 
  onSave: (data: any) => Promise<void>, 
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState<Partial<ServicePricing>>({
    name: '',
    sector: 'web',
    tier: 'starter',
    price: 0,
    priceLabel: '',
    ctaLabel: 'Get Started',
    stripePriceId: '',
    isPopular: false,
    customHtml: '',
    ...initialData,
  });
  
  // Need to map features to unique IDs for dnd-kit
  const [features, setFeatures] = useState<{ id: string, value: string }[]>(
    (initialData?.features || []).map((f, i) => ({ id: `feat-${i}-${Date.now()}`, value: f }))
  );
  const [useHtml, setUseHtml] = useState(!!initialData?.customHtml);
  const [saving, setSaving] = useState(false);

  // Sync features back to formData on change
  useEffect(() => {
    setFormData(prev => ({ ...prev, features: features.map(f => f.value) }));
  }, [features]);

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      ...formData,
      customHtml: useHtml ? formData.customHtml : null,
      price: Number(formData.price),
    });
    setSaving(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFeatures((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addFeature = () => {
    setFeatures([...features, { id: `feat-${Date.now()}`, value: '' }]);
  };

  const removeFeature = (id: string) => {
    setFeatures(features.filter(f => f.id !== id));
  };

  const editFeature = (id: string, value: string) => {
    setFeatures(features.map(f => f.id === id ? { ...f, value } : f));
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-white dark:bg-[#030712] text-slate-900 dark:text-slate-900 dark:text-white overflow-hidden">
      {/* LEFT PANE: EDITOR */}
      <div className="w-1/2 flex flex-col border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#030712] relative">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">{initialData ? 'Edit Plan' : 'Create Plan'}</h2>
          <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white transition rounded-xl hover:bg-slate-200 dark:hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-slate-900 dark:text-white font-bold rounded-xl transition disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Plan'}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {/* Mode Toggle */}
          <div className="flex bg-slate-200 dark:bg-white/5 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setUseHtml(false)}
              className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${!useHtml ? 'bg-blue-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white'}`}
            >
              <LayoutTemplate className="w-4 h-4" /> Standard Builder
            </button>
            <button 
              onClick={() => setUseHtml(true)}
              className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition ${useHtml ? 'bg-purple-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-900 dark:text-white'}`}
            >
              <Code className="w-4 h-4" /> Custom HTML
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Plan Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sector</label>
                <select value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition">
                  <option value="web">Web</option>
                  <option value="image-studio">Image Studio</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price (USD)</label>
                <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price Label</label>
                <input type="text" value={formData.priceLabel || ''} onChange={e => setFormData({...formData, priceLabel: e.target.value})} placeholder="/ month" className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tier</label>
                <select value={formData.tier} onChange={e => setFormData({...formData, tier: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition">
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="Milestone Based">Milestone Based</option>
                  <option value="Per Image">Per Image</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">CTA Label</label>
                <input type="text" value={formData.ctaLabel} onChange={e => setFormData({...formData, ctaLabel: e.target.value})} className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 transition" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl">
              <input type="checkbox" id="popular" checked={formData.isPopular} onChange={e => setFormData({...formData, isPopular: e.target.checked})} className="w-5 h-5 accent-blue-500 rounded" />
              <label htmlFor="popular" className="text-sm font-semibold text-slate-900 dark:text-white">Mark as Popular Plan</label>
            </div>

            {useHtml ? (
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">Custom HTML/Tailwind</label>
                <textarea 
                  value={formData.customHtml || ''} 
                  onChange={e => setFormData({...formData, customHtml: e.target.value})} 
                  className="w-full h-96 bg-slate-100 dark:bg-black/50 border border-white/10 font-mono text-xs text-green-400 p-4 rounded-xl focus:outline-none focus:border-purple-500 transition"
                  placeholder="<div className='p-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl'>...</div>"
                />
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Features</label>
                  <button onClick={addFeature} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 font-bold bg-blue-500/10 px-3 py-1 rounded-full">
                    <Plus className="w-3 h-3" /> Add Feature
                  </button>
                </div>
                
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={features.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {features.map((feature) => (
                      <SortableFeatureItem 
                        key={feature.id} 
                        id={feature.id} 
                        feature={feature.value} 
                        onEdit={(val) => editFeature(feature.id, val)} 
                        onRemove={() => removeFeature(feature.id)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: PREVIEW */}
      <div className="w-1/2 relative flex items-center justify-center p-12 bg-slate-100 dark:bg-gradient-to-br dark:from-[#030712] dark:to-slate-900">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent blur-[120px] pointer-events-none" />
        
        <div className="absolute top-6 left-6 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">Live Preview</span>
        </div>

        {/* Live rendering of the exact frontend component */}
        <div className="w-full max-w-md">
          <PricingCard pkg={{...formData, customHtml: useHtml ? formData.customHtml : null}} index={0} />
        </div>
      </div>
    </div>
  );
}
