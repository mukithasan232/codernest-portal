import { prisma } from '@/lib/prisma';
import ContactClient from '@/components/marketing/ContactClient';

export const revalidate = 60; // Cache for 60 seconds

export default async function ContactPage() {
  let settings = null;
  try {
    settings = await prisma.systemSettings.findUnique({ where: { id: 'global_settings' } });
  } catch (error) {
    // ignore
  }

  return <ContactClient settings={settings} />;
}
