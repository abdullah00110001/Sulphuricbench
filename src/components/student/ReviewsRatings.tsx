import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Star, MessageSquare, ThumbsUp, Edit, Trash2, Plus } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export function ReviewsRatings() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedCourse, setSelectedCourse] = useState("")
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Get user's enrolled courses for review selection
  const { data: enrolledCourses } = useQuery({
    queryKey: ['enrolled-courses-for-review', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          course_id,
          courses(id, title, thumbnail_url)
        `)
        .eq('student_id', user.id)
        .eq('progress_percentage', 100) // Only completed courses

      if (error) throw error
      return data?.map(e => e.courses).filter(Boolean) || []
    },
    enabled: !!user?.id
  })

  // Get user's reviews
  const { data: userReviews, isLoading } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('course_ratings')
        .select(`
          *,
          courses(title, thumbnail_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    },
    enabled: !!user?.id
  })

  // Create review mutation
  const createReviewMutation = useMutation({
    mutationFn: async (reviewData: { course_id: string; rating: number; review: string }) => {
      const { error } = await supabase
        .from('course_ratings')
        .insert({
          user_id: user?.id,
          course_id: reviewData.course_id,
          rating: reviewData.rating,
          review: reviewData.review
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] })
      toast({
        title: "Review submitted!",
        description: "Your review has been submitted and is awaiting approval.",
      })
      setIsDialogOpen(false)
      setSelectedCourse("")
      setRating(5)
      setReview("")
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    }
  })

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from('course_ratings')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] })
      toast({
        title: "Review deleted",
        description: "Your review has been successfully deleted.",
      })
    }
  })

  const handleSubmitReview = () => {
    if (!selectedCourse || !review.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a course and write a review.",
        variant: "destructive",
      })
      return
    }

    createReviewMutation.mutate({
      course_id: selectedCourse,
      rating,
      review: review.trim()
    })
  }

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
          <p className="text-muted-foreground">Loading your reviews...</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48" />
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
          <p className="text-muted-foreground">
            {userReviews?.length || 0} review{userReviews?.length !== 1 ? 's' : ''} submitted
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Write a Course Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Course</label>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a completed course" />
                  </SelectTrigger>
                  <SelectContent>
                    {enrolledCourses?.map((course: any) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                {renderStars(rating, true, setRating)}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Your Review</label>
                <Textarea
                  placeholder="Share your experience with this course..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={createReviewMutation.isPending}
                >
                  {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Review Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userReviews?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userReviews?.length 
                ? (userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length).toFixed(1)
                : '0.0'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {userReviews?.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground mb-4">
              Complete a course and share your experience with others
            </p>
            {enrolledCourses?.length === 0 ? (
              <Button variant="outline">Browse Courses</Button>
            ) : (
              <Button onClick={() => setIsDialogOpen(true)}>
                Write Your First Review
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {userReviews?.map((review: any) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={review.courses?.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop"}
                      alt={review.courses?.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{review.courses?.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Pending Approval
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteReviewMutation.mutate(review.id)}
                      disabled={deleteReviewMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {review.review}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
