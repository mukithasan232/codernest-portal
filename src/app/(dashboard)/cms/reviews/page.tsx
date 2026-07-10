import { getAllReviews } from '@/lib/actions/review.actions';
import ReviewsClient from '@/components/cms/ReviewsClient';
import { Testimonial } from '@/types';

export default async function ReviewsPage() {
  const { data, success } = await getAllReviews();
  const initialReviews: Testimonial[] = success && data ? data : [];

  return <ReviewsClient initialReviews={initialReviews} />;
}
