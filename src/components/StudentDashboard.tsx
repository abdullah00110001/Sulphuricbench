
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Award, TrendingUp, Play } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'

export function StudentDashboard() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Login Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please log in to access your dashboard
          </p>
          <Button onClick={() => navigate('/auth')} className="w-full">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['student-enrollments', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      console.log('Fetching enrollments for user:', user.id)

      const { data, error } = await supabase
        .from('enrollments')
        .select(`
          *,
          courses(
            id,
            title,
            description,
            thumbnail_url,
            duration_hours,
            difficulty_level,
            profiles:instructor_id(full_name)
          )
        `)
        .eq('student_id', user.id)
        .order('enrolled_at', { ascending: false })

      if (error) {
        console.error('Error fetching enrollments:', error)
        return []
      }

      console.log('Enrollments data:', data)
      return data || []
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 3
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['student-stats', user?.id, enrollments.length],
    queryFn: async () => {
      if (!user?.id || enrollments.length === 0) {
        return {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalHours: 0,
          averageProgress: 0
        }
      }

      const completedCourses = enrollments.filter(e => e.progress_percentage === 100).length
      const inProgressCourses = enrollments.filter(e => e.progress_percentage > 0 && e.progress_percentage < 100).length
      const totalHours = enrollments.reduce((sum, e) => sum + (e.courses?.duration_hours || 0), 0)
      const averageProgress = enrollments.length > 0 
        ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress_percentage || 0), 0) / enrollments.length)
        : 0

      return {
        totalCourses: enrollments.length,
        completedCourses,
        inProgressCourses,
        totalHours,
        averageProgress
      }
    },
    enabled: !!user?.id
  })

  const isDataLoading = enrollmentsLoading || statsLoading

  if (isDataLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-24 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 md:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-[#00CFFF] to-blue-600 text-white">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Student'}!
              </h1>
              <p className="text-blue-100 text-sm md:text-base">
                Continue your learning journey and achieve your goals
              </p>
            </div>
            <div className="text-center md:text-right">
              <div className="text-2xl md:text-3xl font-bold">{profile?.points || 0}</div>
              <div className="text-xs md:text-sm text-blue-100">Total Points</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8 text-[#00CFFF]" />
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Enrolled</p>
                <p className="text-lg md:text-2xl font-bold dark:text-white">{stats?.totalCourses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center">
              <Award className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-lg md:text-2xl font-bold dark:text-white">{stats?.completedCourses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <p className="text-lg md:text-2xl font-bold dark:text-white">{stats?.inProgressCourses || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center">
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
              <div className="ml-3 md:ml-4">
                <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">Hours</p>
                <p className="text-lg md:text-2xl font-bold dark:text-white">{stats?.totalHours || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl dark:text-white">My Courses</CardTitle>
          <CardDescription className="dark:text-gray-400">
            {enrollments.length > 0 
              ? `You are enrolled in ${enrollments.length} course${enrollments.length > 1 ? 's' : ''}`
              : 'No courses enrolled yet'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="cursor-pointer hover:shadow-md transition-shadow dark:bg-gray-800 dark:border-gray-700"
                      onClick={() => navigate(`/course/${enrollment.courses?.id}`)}>
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={enrollment.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'}
                      alt={enrollment.courses?.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 dark:text-white text-sm md:text-base">
                      {enrollment.courses?.title}
                    </h3>
                    
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {enrollment.courses?.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="dark:text-gray-300">Progress</span>
                        <span className="font-medium dark:text-white">{enrollment.progress_percentage || 0}%</span>
                      </div>
                      
                      <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                      
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600">
                          {enrollment.courses?.difficulty_level || 'Beginner'}
                        </Badge>
                        
                        <Button size="sm" variant="outline" className="text-xs">
                          <Play className="w-3 h-3 mr-1" />
                          Continue
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        By {enrollment.courses?.profiles?.full_name || 'Unknown Instructor'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12">
              <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-base md:text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No Courses Yet</h3>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-500 mb-4">
                Start your learning journey by enrolling in a course
              </p>
              <Button onClick={() => navigate('/')} className="bg-[#00CFFF] hover:bg-[#00B8E6]">
                Browse Courses
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
