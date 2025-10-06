import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BookOpen, Play, Star, Clock } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

export function MyCourses() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      // Fetch from both enrollment tables  
      const [enrollmentsResult, enrollmentsV2Result] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            *,
            courses(
              *,
              profiles:instructor_id(full_name, avatar_url)
            )
          `)
          .eq('student_id', user.id)
          .order('enrolled_at', { ascending: false }),
        
        supabase
          .from('enrollments_v2')
          .select(`
            *,
            courses(
              *,
              profiles:instructor_id(full_name, avatar_url)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (enrollmentsResult.error) throw enrollmentsResult.error
      if (enrollmentsV2Result.error) throw enrollmentsV2Result.error
      
      // Combine and normalize both enrollment types
      const normalizedEnrollments = [
        ...(enrollmentsResult.data || []).map(e => ({
          ...e,
          enrolled_at: e.enrolled_at,
          progress_percentage: e.progress_percentage || 0
        })),
        ...(enrollmentsV2Result.data || []).map(e => ({
          ...e,
          enrolled_at: e.created_at,
          progress_percentage: 0 // v2 enrollments don't have progress yet
        }))
      ]
      
      return normalizedEnrollments
    },
    enabled: !!user?.id
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-gray-200 rounded-t-lg" />
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded mb-4" />
                <div className="h-2 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Fixed: Navigate to course content for enrolled users
  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}/content`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Courses</h2>
          <p className="text-muted-foreground">
            {enrollments?.length || 0} course{enrollments?.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/courses')}>
          <BookOpen className="h-4 w-4 mr-2" />
          Browse More Courses
        </Button>
      </div>

      {enrollments?.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your learning journey by enrolling in a course
            </p>
            <Button onClick={() => navigate('/courses')}>
              Browse Courses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments?.map((enrollment: any) => {
            const course = enrollment.courses
            const progress = enrollment.progress_percentage || 0
            
            return (
              <Card 
                key={enrollment.id} 
                className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => handleCourseClick(course.id)}
              >
                <div className="aspect-video relative">
                  <img
                    src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                    alt={course.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Button size="lg" className="bg-white/90 text-black hover:bg-white">
                      <Play className="h-5 w-5 mr-2" />
                      Continue
                    </Button>
                  </div>
                  <Badge className="absolute top-2 right-2 bg-primary">
                    {progress}% Complete
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={course.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {course.profiles?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {course.profiles?.full_name}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {course.title}
                  </h3>
                  <Progress value={progress} className="mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration_hours}h</span>
                      </div>
                    </div>
                    <Badge variant={progress === 100 ? "default" : "secondary"}>
                      {progress === 100 ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}