import { getGlobalSettings, getEmailTemplates } from '@/lib/actions/admin.actions';
import SettingsClient from '@/components/admin/SettingsClient';

export default async function AdminSettingsPage() {
  const [settingsRes, templatesRes] = await Promise.all([
    getGlobalSettings(),
    getEmailTemplates()
  ]);

  const initialSettings = settingsRes.success ? settingsRes.data : null;
  const initialTemplates = (templatesRes.success ? templatesRes.data : []) || [];

  return (
    <div className="p-6 md:p-8 h-full">
      <SettingsClient 
        initialSettings={initialSettings} 
        initialTemplates={initialTemplates} 
      />
    </div>
  );
}
