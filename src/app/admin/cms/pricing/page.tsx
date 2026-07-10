'use client';

/**
 * Admin CMS — Service Pricing Manager
 */

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ServicePricing } from '@/types';
import CmsEditor, { CmsField } from '@/components/admin/CmsEditor';
import { Plus, DollarSign, Star, Pencil } from 'lucide-react';

const PRICING_FIELDS: CmsField[] = [
  { key: 'name',           label: 'Plan Name',        type: 'text',     required: true, placeholder: 'Pro Package' },
  { key: 'sector',         label: 'Sector',           type: 'select',   required: true, options: ['web', 'image-studio'] },
  { key: 'tier',           label: 'Tier',             type: 'select',   required: true, options: ['starter', 'pro', 'enterprise'] },
  { key: 'price',          label: 'Price (USD)',       type: 'number',   required: true },
  { key: 'priceLabel',     label: 'Price Label',      type: 'text',     placeholder: '/ month or / image' },
  { key: 'features',       label: 'Features',         type: 'tags',     placeholder: 'Add feature…' },
  { key: 'ctaLabel',       label: 'CTA Button Label', type: 'text',     required: true, placeholder: 'Get Started' },
  { key: 'stripePriceId',  label: 'Stripe Price ID',  type: 'text',     placeholder: 'price_…' },
  { key: 'isPopular',      label: 'Mark as Popular',  type: 'boolean' },
];

export default function PricingCmsPage() {
  const [plans, setPlans] = useState<ServicePricing[]>([]);
  const [editing, setEditing] = useState<(ServicePricing & { id: string }) | null>(null);
  const [creating, setCreating] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchPlans = async () => {
      const { data } = await supabase.from('servicePricing').select('*').order('price', { ascending: true });
      if (data) setPlans(data as ServicePricing[]);
    };

    fetchPlans();

    const channel = supabase
      .channel('admin_pricing_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'servicePricing' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setPlans(prev => [...prev, payload.new as ServicePricing].sort((a, b) => a.price - b.price));
        } else if (payload.eventType === 'UPDATE') {
          setPlans(prev => prev.map(p => p.id === payload.new.id ? (payload.new as ServicePricing) : p).sort((a, b) => a.price - b.price));
        } else if (payload.eventType === 'DELETE') {
          setPlans(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const showEditor = editing || creating;

  const formatPrice = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Service Pricing</h1>
          <p className="text-slate-400 mt-1">{plans.length} pricing plan{plans.length !== 1 ? 's' : ''}</p>
        </div>
        {!showEditor && (
          <button
            id="pricing-new-btn"
            onClick={() => { setEditing(null); setCreating(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> New Plan
          </button>
        )}
      </div>

      {showEditor && (
        <CmsEditor
          collectionName="servicePricing"
          fields={PRICING_FIELDS}
          item={editing}
          onSuccess={() => { setEditing(null); setCreating(false); }}
          onCancel={() => { setEditing(null); setCreating(false); }}
        />
      )}

      {!showEditor && (
        <div className="glass rounded-3xl border border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            {plans.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
                No pricing plans yet.
              </div>
            )}
            {plans.map(plan => (
              <div key={plan.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white">{plan.name}</h3>
                      {plan.isPopular && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                    </div>
                    <p className="text-xs text-slate-500">
                      {plan.sector} · {plan.tier} · <span className="text-green-400 font-bold">{formatPrice(plan.price)}{plan.priceLabel ? ` ${plan.priceLabel}` : ''}</span>
                    </p>
                  </div>
                </div>
                <button
                  id={`pricing-edit-${plan.id}`}
                  onClick={() => { setEditing(plan as ServicePricing & { id: string }); setCreating(false); }}
                  className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
