import { getDynamicPageBySlug } from '@/lib/actions/pages.actions';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const res = await getDynamicPageBySlug(slug);
  
  if (!res.success || !res.data || !res.data.isPublished) {
    return { title: 'Not Found' };
  }

  return {
    title: res.data.metaTitle || res.data.title,
    description: res.data.metaDesc || `View ${res.data.title}`,
    keywords: res.data.keywords ? res.data.keywords.split(',').map((k: string) => k.trim()) : undefined,
  };
}

export default async function DynamicCatchAllPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await getDynamicPageBySlug(slug);
  
  // Return 404 if page doesn't exist or isn't published
  if (!res.success || !res.data || !res.data.isPublished) {
    notFound();
  }

  const { htmlContent, cssContent, jsContent } = res.data;

  return (
    <>
      {cssContent && (
        <style dangerouslySetInnerHTML={{ __html: cssContent }} />
      )}
      
      {/* 
        Warning: dangerouslySetInnerHTML is required here to render the raw HTML.
        Because this is an admin-controlled CMS, we trust the input. 
      */}
      {htmlContent && (
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      )}

      {jsContent && (
        <script dangerouslySetInnerHTML={{ __html: jsContent }} />
      )}
    </>
  );
}
