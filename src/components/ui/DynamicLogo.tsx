import { getGlobalSettings } from '@/lib/actions/admin.actions';
import { Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default async function DynamicLogo({ className = '' }: { className?: string }) {
  const { data: settings } = await getGlobalSettings();
  const logoUrl = settings?.logo_url;

  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      {logoUrl ? (
        <div className="w-10 h-10 relative">
          <Image 
            src={logoUrl} 
            alt="CoderNest Logo" 
            fill
            className="rounded-xl object-contain" 
            sizes="40px"
          />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
      )}
      <span className="text-xl font-bold text-white hidden sm:block">CoderNest</span>
    </Link>
  );
}
