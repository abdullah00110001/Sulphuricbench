import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Play, 
  Download, 
  BookOpen, 
  FileText, 
  Video, 
  Users, 
  Clock,
  CheckCircle,
  Lock,
  ArrowLeft
} from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"

export function CourseContent() {
  const { courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course-content', courseId],
    queryFn: async () => {
      if (!courseId) return null
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id(full_name, avatar_url)
        `)
        .eq('id', courseId)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!courseId
  })

  const { data: enrollment, isLoading: enrollmentLoading } = useQuery({
    queryKey: ['course-enrollment', courseId, user?.id],
    queryFn: async () => {
      if (!courseId || !user?.id) return null
      
      // Check both enrollment tables
      const [enrollmentResult, enrollmentV2Result] = await Promise.all([
        supabase
          .from('enrollments')
          .select('*')
          .eq('course_id', courseId)
          .eq('student_id', user.id)
          .maybeSingle(),
        supabase
          .from('enrollments_v2')
          .select('*')
          .eq('course_id', courseId)
          .eq('user_id', user.id)
          .maybeSingle()
      ])
      
      return enrollmentResult.data || enrollmentV2Result.data
    },
    enabled: !!courseId && !!user?.id
  })

  if (courseLoading || enrollmentLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Fixed: Check enrollment before showing access denied
  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <Button onClick={() => navigate('/student/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Fixed: Only show access denied if user is NOT enrolled
  if (!enrollment && !courseLoading && !enrollmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              Please enroll in this course to access the content.
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate(`/course/${courseId}`)} className="w-full">
                View Course Details
              </Button>
              <Button variant="outline" onClick={() => navigate('/student/dashboard')} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need to enroll in this course to view the content.</p>
          <Button onClick={() => navigate(`/course/${courseId}`)}>
            View Course Details
          </Button>
        </div>
      </div>
    )
  }

  // Mock course content - in real app this would come from database
  const lessons = [
    {
      id: 1,
      title: "Introduction to the Course",
      duration: "10 mins",
      type: "video",
      isCompleted: true,
      isLocked: false
    },
    {
      id: 2,
      title: "Basic Concepts",
      duration: "15 mins",
      type: "video",
      isCompleted: true,
      isLocked: false
    },
    {
      id: 3,
      title: "Practical Examples",
      duration: "20 mins",
      type: "video",
      isCompleted: false,
      isLocked: false
    },
    {
      id: 4,
      title: "Assignment 1",
      duration: "30 mins",
      type: "assignment",
      isCompleted: false,
      isLocked: false
    },
    {
      id: 5,
      title: "Advanced Topics",
      duration: "25 mins",
      type: "video",
      isCompleted: false,
      isLocked: true
    }
  ]

  const resources = [
    { id: 1, name: "Course Slides.pdf", type: "pdf", size: "2.5 MB" },
    { id: 2, name: "Source Code.zip", type: "zip", size: "1.2 MB" },
    { id: 3, name: "Reading List.pdf", type: "pdf", size: "500 KB" }
  ]

  const completedLessons = lessons.filter(l => l.isCompleted).length
  const progress = Math.round((completedLessons / lessons.length) * 100)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/student/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Course Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <img
                src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                alt={course.title}
                className="w-full lg:w-80 h-48 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h1 className="text-2xl lg:text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{course.description}</p>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <Badge variant="outline">
                    <Clock className="h-3 w-3 mr-1" />
                    {course.duration_hours} hours
                  </Badge>
                  <Badge variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    {course.total_students} students
                  </Badge>
                  <Badge variant="outline">
                    {course.difficulty_level}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}% Complete</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                  By {course.profiles?.full_name || 'Unknown Instructor'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="lessons" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="lessons">Lessons</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
              </TabsList>

              <TabsContent value="lessons" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Course Lessons
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                          lesson.isLocked
                            ? 'bg-gray-50 dark:bg-gray-800 border-gray-200'
                            : 'bg-white dark:bg-gray-900 border-gray-200 hover:border-blue-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            lesson.isCompleted
                              ? 'bg-green-100 text-green-600'
                              : lesson.isLocked
                              ? 'bg-gray-100 text-gray-400'
                              : 'bg-blue-100 text-blue-600'
                          }`}>
                            {lesson.isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : lesson.isLocked ? (
                              <Lock className="h-4 w-4" />
                            ) : lesson.type === 'video' ? (
                              <Video className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <h3 className={`font-medium ${lesson.isLocked ? 'text-gray-400' : ''}`}>
                              {lesson.title}
                            </h3>
                            <p className="text-sm text-gray-500">{lesson.duration}</p>
                          </div>
                        </div>
                        
                        {!lesson.isLocked && (
                          <Button size="sm" variant={lesson.isCompleted ? "outline" : "default"}>
                            {lesson.isCompleted ? "Review" : "Start"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Course Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {resources.map((resource) => (
                      <div
                        key={resource.id}
                        className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium">{resource.name}</h3>
                            <p className="text-sm text-gray-500">{resource.size}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Discussion</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-center text-gray-500 py-8">
                      Discussion feature coming soon!
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>Your Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{progress}%</div>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lessons completed</span>
                      <span>{completedLessons}/{lessons.length}</span>
                    </div>
                    <Progress value={progress} />
                  </div>

                  <Button className="w-full">
                    Continue Learning
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Resources
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Join Study Group
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
              </CardContent>
            </Card>

            {/* Secret Group Access */}
            {course.secret_group_link && (
              <Card>
                <CardHeader>
                  <CardTitle>Exclusive Group</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Access our private discussion group for this course.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => window.open(course.secret_group_link, '_blank')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Group
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}