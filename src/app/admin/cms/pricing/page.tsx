'use client';

import { useState, useEffect } from 'react';
import type { ServicePricing } from '@/types';
import { Plus, DollarSign, Star, Pencil, GripVertical } from 'lucide-react';
import { getCmsEntries, createCmsEntry, updateCmsEntry, updatePricingOrder } from '@/lib/actions/cms.actions';
import PricingSplitEditor from '@/components/admin/PricingSplitEditor';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortablePlanItem({ plan, onEdit }: { plan: ServicePricing & { id: string }, onEdit: (p: any) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: plan.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatPrice = (n: number) => `$${n.toLocaleString()}`;

  return (
    <div ref={setNodeRef} style={style} className="p-5 flex items-center justify-between hover:bg-white/5 transition bg-transparent group">
      <div className="flex items-center gap-4">
        <div {...attributes} {...listeners} className="cursor-grab p-2 text-slate-500 hover:text-white transition opacity-50 group-hover:opacity-100">
          <GripVertical className="w-5 h-5" />
        </div>
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
        onClick={() => onEdit(plan)}
        className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
      >
        <Pencil className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function PricingCmsPage() {
  const [plans, setPlans] = useState<(ServicePricing & { id: string })[]>([]);
  const [editing, setEditing] = useState<(ServicePricing & { id: string }) | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchPlans = async () => {
    const res = await getCmsEntries('service_pricing');
    if (res.success && res.data) {
      const fetched = res.data as (ServicePricing & { id: string })[];
      // Sort by displayOrder first, then by price if displayOrder is equal
      fetched.sort((a, b) => {
        if ((a.displayOrder ?? 0) !== (b.displayOrder ?? 0)) {
          return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
        }
        return a.price - b.price;
      });
      setPlans(fetched);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setPlans((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Immediately trigger server update for displayOrder
        const updates = newItems.map((item, index) => ({ id: item.id, displayOrder: index }));
        updatePricingOrder(updates);
        
        return newItems;
      });
    }
  };

  const handleSave = async (data: any) => {
    if (creating) {
      await createCmsEntry('service_pricing', { ...data, displayOrder: plans.length });
    } else if (editing) {
      await updateCmsEntry('service_pricing', editing.id, data);
    }
    setEditing(null);
    setCreating(false);
    fetchPlans();
  };

  const showEditor = editing || creating;

  return (
    <div className="space-y-8">
      {!showEditor && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Service Pricing</h1>
            <p className="text-slate-400 mt-1">{plans.length} pricing plan{plans.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            id="pricing-new-btn"
            onClick={() => { setEditing(null); setCreating(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-all"
          >
            <Plus className="w-4 h-4" /> New Plan
          </button>
        </div>
      )}

      {showEditor && (
        <PricingSplitEditor 
          initialData={editing}
          onSave={handleSave}
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
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={plans.map(p => p.id)} strategy={verticalListSortingStrategy}>
                {plans.map(plan => (
                  <SortablePlanItem key={plan.id} plan={plan} onEdit={(p) => { setEditing(p); setCreating(false); }} />
                ))}
              </SortableContext>
            </DndContext>
            
          </div>
        </div>
      )}
    </div>
  );
}
