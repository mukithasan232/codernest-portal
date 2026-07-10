import { getLeads } from '@/lib/actions/crm.actions';
import CrmClient from '@/components/crm/CrmClient';
import { Lead } from '@/types';

export default async function CrmPage() {
  const { data, success } = await getLeads();
  
  const initialLeads: Lead[] = success && data ? data.map(dbLead => ({
    id: dbLead.id,
    name: dbLead.name,
    email: dbLead.email,
    company: dbLead.company,
    message: dbLead.message,
    status: dbLead.status,
    created_at: dbLead.created_at
  })) : [];

  return (
    <div className="p-6 md:p-8 h-full">
      <CrmClient initialLeads={initialLeads} />
    </div>
  );
}
