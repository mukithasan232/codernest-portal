import BrandPromotionManager from '@/components/admin/BrandPromotionManager';

export const metadata = {
  title: 'Brand Promotions | Admin Dashboard',
};

export default function PromotionsPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Brand Promotions
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your affiliate links, banner ads, and brand promotions.
          </p>
        </div>
      </div>
      
      <BrandPromotionManager />
    </div>
  );
}
