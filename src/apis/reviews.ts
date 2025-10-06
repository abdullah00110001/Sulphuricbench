import { supabase } from '@/integrations/supabase/client'

export interface Review {
  id?: string
  user_id?: string
  course_id?: string
  rating: number
  review_text: string
  user_name: string
  user_role?: string
  user_company?: string
  user_avatar?: string
  is_approved?: boolean
  created_at?: string
  updated_at?: string
}

export const reviewsApi = {
  // Create a new review
  async createReview(review: Omit<Review, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        ...review,
        is_approved: false // Reviews need approval
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all approved reviews
  async getApprovedReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get reviews by user
  async getUserReviews(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get all reviews for admin
  async getAllReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Approve/reject review
  async updateReviewStatus(reviewId: string, isApproved: boolean) {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        is_approved: isApproved,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete review
  async deleteReview(reviewId: string) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) throw error
  }
}