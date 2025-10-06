import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Star } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { reviewsApi } from '@/apis/reviews'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export function ReviewForm() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userCompany, setUserCompany] = useState('')
  const [reviewType, setReviewType] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [loading, setLoading] = useState(false)

  // Fetch user's enrolled courses
  const { data: courses = [] } = useQuery({
    queryKey: ['user-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      
      const [enrollmentsResult, enrollmentsV2Result] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            courses(id, title)
          `)
          .eq('student_id', user.id),
        supabase
          .from('enrollments_v2')
          .select(`
            courses(id, title)
          `)
          .eq('user_id', user.id)
      ])

      const allCourses = [
        ...(enrollmentsResult.data || []).map(e => e.courses).filter(Boolean),
        ...(enrollmentsV2Result.data || []).map(e => e.courses).filter(Boolean)
      ]

      // Remove duplicates and filter out any invalid entries
      const uniqueCourses = allCourses
        .filter((course): course is { id: string; title: string } => 
          course != null && typeof course === 'object' && 'id' in course && 'title' in course
        )
        .filter((course, index, self) => 
          index === self.findIndex(c => c.id === course.id)
        )

      return uniqueCourses
    },
    enabled: !!user?.id
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !profile) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review.",
        variant: "destructive"
      })
      return
    }

    if (reviewText.trim().length < 10) {
      toast({
        title: "Review Too Short",
        description: "Please write at least 10 characters for your review.",
        variant: "destructive"
      })
      return
    }

    if (!reviewType) {
      toast({
        title: "Missing Review Type",
        description: "Please select what you want to review.",
        variant: "destructive"
      })
      return
    }

    if (reviewType === 'course' && !selectedCourse) {
      toast({
        title: "Missing Course Selection",
        description: "Please select a course to review.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const reviewData: any = {
        user_id: user.id,
        rating,
        review_text: `[${reviewType.toUpperCase()}] ${reviewText.trim()}`,
        user_name: profile.full_name,
        user_role: userRole.trim() || 'Student',
        user_company: userCompany.trim() || '',
        user_avatar: profile.avatar_url || ''
      }

      // If reviewing a specific course, add course_id
      if (reviewType === 'course' && selectedCourse) {
        reviewData.course_id = selectedCourse
      }

      await reviewsApi.createReview(reviewData)

      toast({
        title: "Review Submitted",
        description: "Thank you for your review! It will be published after approval.",
      })

      // Reset form
      setRating(5)
      setReviewText('')
      setUserRole('')
      setUserCompany('')
      setReviewType('')
      setSelectedCourse('')
    } catch (error: any) {
      console.error('Error submitting review:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to write a review.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Share Your Experience</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                      star <= rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                ({rating} star{rating !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {/* Review Type Selection */}
          <div className="space-y-2">
            <Label>What would you like to review?</Label>
            <Select value={reviewType} onValueChange={setReviewType}>
              <SelectTrigger>
                <SelectValue placeholder="Select review type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="website">Website/Platform</SelectItem>
                <SelectItem value="general">General Experience</SelectItem>
                <SelectItem value="course">Specific Course</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Course Selection (only if reviewing a course) */}
          {reviewType === 'course' && (
            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course you've enrolled in" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: any) => (
                    <SelectItem key={course?.id} value={course?.id}>
                      {course?.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Review Text */}
          <div className="space-y-2">
            <Label htmlFor="reviewText">Your Review</Label>
            <Textarea
              id="reviewText"
              placeholder={
                reviewType === 'website' 
                  ? "Share your experience with our learning platform..." 
                  : reviewType === 'course'
                  ? "Tell us about this specific course..."
                  : "Tell us about your overall experience..."
              }
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              required
              minLength={10}
            />
          </div>

          {/* User Role */}
          <div className="space-y-2">
            <Label htmlFor="userRole">Your Role/Position</Label>
            <Input
              id="userRole"
              placeholder="e.g., Web Developer, Student, etc."
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
            />
          </div>

          {/* User Company */}
          <div className="space-y-2">
            <Label htmlFor="userCompany">Company/Organization (Optional)</Label>
            <Input
              id="userCompany"
              placeholder="e.g., Tech Solutions, University, etc."
              value={userCompany}
              onChange={(e) => setUserCompany(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}