import { getPortfolioImages } from '@/lib/actions/portfolio.actions';
import PortfolioClient from '@/components/admin/PortfolioClient';

export default async function AdminPortfolioPage() {
  const { data, success } = await getPortfolioImages();
  
  const initialImages = success && data ? data : [];

  return (
    <div className="p-6 md:p-8 h-full">
      <PortfolioClient initialImages={initialImages} />
    </div>
  );
}
