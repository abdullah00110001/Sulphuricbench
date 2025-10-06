import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useQuery } from "@tanstack/react-query"
import { Star } from "lucide-react"

export function EnhancedReviewForm() {
  const [reviewType, setReviewType] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [rating, setRating] = useState<number>(0)
  const [reviewText, setReviewText] = useState("")
  const [userName, setUserName] = useState("")
  const [userRole, setUserRole] = useState("")
  const [userCompany, setUserCompany] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const { user, profile } = useAuth()
  
  // Fetch courses for the dropdown
  const { data: courses } = useQuery({
    queryKey: ['courses-for-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('is_published', true)
        .order('title')
      
      if (error) throw error
      return data
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reviewType || !rating || !reviewText.trim() || !userName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    if (reviewType === "course" && !selectedCourse) {
      toast({
        title: "Course Selection Required",
        description: "Please select a course to review",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      const reviewData = {
        user_id: user?.id || null,
        course_id: reviewType === "course" ? selectedCourse : null,
        rating,
        review_text: reviewText,
        user_name: userName,
        user_role: userRole || null,
        user_company: userCompany || null,
        user_avatar: profile?.avatar_url || null,
        is_approved: false
      }

      const { error } = await supabase
        .from('reviews')
        .insert(reviewData)

      if (error) {
        console.error('Error submitting review:', error)
        toast({
          title: "Error",
          description: "Failed to submit review. Please try again.",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Review Submitted!",
        description: "Thank you for your feedback. Your review will be published after approval.",
      })

      // Reset form
      setReviewType("")
      setSelectedCourse("")
      setRating(0)
      setReviewText("")
      setUserName("")
      setUserRole("")
      setUserCompany("")

    } catch (error) {
      console.error('Error submitting review:', error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarRating = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="transition-colors"
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-muted-foreground">
          {rating ? `${rating} star${rating !== 1 ? 's' : ''}` : 'Select rating'}
        </span>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>What would you like to review? *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                type="button"
                variant={reviewType === 'website' ? 'default' : 'outline'}
                onClick={() => {
                  setReviewType('website')
                  setSelectedCourse('')
                }}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <span className="text-2xl">🌐</span>
                <span className="font-semibold">Website</span>
                <span className="text-xs opacity-70">Overall experience</span>
              </Button>
              <Button
                type="button"
                variant={reviewType === 'general' ? 'default' : 'outline'}
                onClick={() => {
                  setReviewType('general')
                  setSelectedCourse('')
                }}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <span className="text-2xl">📚</span>
                <span className="font-semibold">General Course</span>
                <span className="text-xs opacity-70">All courses feedback</span>
              </Button>
              <Button
                type="button"
                variant={reviewType === 'course' ? 'default' : 'outline'}
                onClick={() => setReviewType('course')}
                className="h-auto py-4 flex flex-col gap-2"
              >
                <span className="text-2xl">🎓</span>
                <span className="font-semibold">Specific Course</span>
                <span className="text-xs opacity-70">Rate a course</span>
              </Button>
            </div>
          </div>

          {reviewType === "course" && (
            <div className="space-y-2">
              <Label htmlFor="course">Select Course *</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose the course to review" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select the specific course you want to review
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Rating *</Label>
            {renderStarRating()}
          </div>

          <div className="space-y-2">
            <Label htmlFor="userName">Your Name *</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userRole">Your Role (Optional)</Label>
            <Input
              id="userRole"
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              placeholder="e.g., Student, Professional, Teacher"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userCompany">Institution/Company (Optional)</Label>
            <Input
              id="userCompany"
              value={userCompany}
              onChange={(e) => setUserCompany(e.target.value)}
              placeholder="e.g., ABC University, XYZ Company"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewText">Your Review *</Label>
            <Textarea
              id="reviewText"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={
                reviewType === "website" 
                  ? "Share your experience with our platform, user interface, and overall service..."
                  : reviewType === "general"
                  ? "Share your thoughts about our courses in general, teaching quality, and learning experience..."
                  : reviewType === "course"
                  ? "Tell us about your experience with this specific course, content quality, and learning outcomes..."
                  : "Share your experience..."
              }
              className="min-h-[100px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              {reviewType === 'website' && 'Review the website design, navigation, and overall user experience'}
              {reviewType === 'general' && 'Share your general feedback about our courses and teaching approach'}
              {reviewType === 'course' && 'Provide detailed feedback about the selected course'}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}