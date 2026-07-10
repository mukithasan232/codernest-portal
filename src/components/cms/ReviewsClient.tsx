'use client';

import { useState } from 'react';
import { Star, MessageSquareQuote, CheckCircle2, CircleDashed, Trash2, Plus, X } from 'lucide-react';
import { updateReview, deleteReview, createReview } from '@/lib/actions/review.actions';
import { Testimonial } from '@/types';
import toast from 'react-hot-toast';

export default function ReviewsClient({ initialReviews }: { initialReviews: Testimonial[] }) {
  const [reviews, setReviews] = useState<Testimonial[]>(initialReviews);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setIsUpdating(id);
    const formData = new FormData();
    formData.append('is_published', (!currentStatus).toString());
    
    // Optimistic update
    setReviews(reviews.map(r => r.id === id ? { ...r, is_published: !currentStatus } : r));
    
    const res = await updateReview(id, formData);
    if (res.success) {
      toast.success(currentStatus ? 'Review unpublished' : 'Review published live');
    } else {
      toast.error(res.error || 'Failed to update status');
      // Revert on error
      setReviews(initialReviews);
    }
    setIsUpdating(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    setIsUpdating(id);
    const res = await deleteReview(id);
    if (res.success) {
      toast.success('Review deleted');
      setReviews(reviews.filter(r => r.id !== id));
    } else {
      toast.error(res.error || 'Failed to delete');
    }
    setIsUpdating(null);
  };

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    const res = await createReview(formData);
    
    if (res.success && res.data) {
      toast.success('Review added successfully');
      setReviews([res.data as Testimonial, ...reviews]);
      setShowAddForm(false);
      e.currentTarget.reset();
    } else {
      toast.error(res.error || 'Failed to add review');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full h-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-orange-500 dark:text-orange-400 mb-2">
            <MessageSquareQuote className="w-5 h-5" />
            <span className="font-semibold uppercase tracking-wider text-sm">CMS Dashboard</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Client{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 drop-shadow-[0_0_15px_rgba(249,115,22,0.2)] dark:drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]">
              Reviews
            </span>
          </h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-semibold shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all"
        >
          {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {showAddForm ? 'Cancel' : 'Add Review'}
        </button>
      </div>

      {/* Add Review Form */}
      {showAddForm && (
        <div className="mb-8 p-6 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl shadow-lg dark:shadow-none animate-in slide-in-from-top-4">
          <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add New Review</h2>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
                <input required type="text" name="client_name" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Designation</label>
                <input type="text" name="designation_company" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Review Text</label>
              <textarea required name="review_text" rows={4} className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rating (1-5)</label>
                <input required type="number" name="rating" min="1" max="5" defaultValue="5" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500" />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 mb-2">
                  <input type="checkbox" name="is_published" value="true" defaultChecked className="w-4 h-4 text-orange-500 bg-slate-50 dark:bg-black/20 border-slate-300 dark:border-white/10 rounded" />
                  <span>Publish Immediately</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border-slate-200 dark:bg-white/[0.02] dark:border-white/10 backdrop-blur-xl border rounded-3xl overflow-hidden shadow-sm dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20">
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Client</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Review</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Rating</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No reviews found. Click "Add Review" to add some!
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 align-top max-w-[200px]">
                      <div className="font-medium text-slate-900 dark:text-white mb-1 truncate">{review.client_name}</div>
                      <div className="text-xs text-slate-500 truncate">{review.designation_company || '-'}</div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-[300px]">
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2" title={review.review_text}>
                        "{review.review_text}"
                      </p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <button 
                        onClick={() => handleTogglePublish(review.id, review.is_published)}
                        disabled={isUpdating === review.id}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                          review.is_published 
                            ? 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20' 
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10 dark:hover:bg-white/10'
                        } disabled:opacity-50`}
                      >
                        {review.is_published ? <CheckCircle2 className="w-3 h-3" /> : <CircleDashed className="w-3 h-3" />}
                        {review.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDelete(review.id)}
                          disabled={isUpdating === review.id}
                          className="p-2 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-lg border border-red-200 dark:border-red-500/20 transition-colors disabled:opacity-50"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
