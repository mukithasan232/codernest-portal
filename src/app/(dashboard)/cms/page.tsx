import { getBlogs } from '@/lib/actions/blog.actions';
import CmsClient from './CmsClient';

export default async function CmsPage() {
  const { data, success } = await getBlogs();
  const initialBlogs = success && data ? data : [];

  return <CmsClient initialBlogs={initialBlogs} />;
}
