
import { useAuth } from '@/hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, Clock, Award, TrendingUp, Play, Star, Trophy, Bookmark, MessageSquare, Calendar, Download, Users, Target, Activity } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import { CourseSlider } from './super-admin/CourseSlider'
import { DashboardOverview } from '@/components/student/DashboardOverview'
import { PaymentHistory } from '@/components/student/PaymentHistory'
import { ProfileManagement } from '@/components/student/ProfileManagement'
import { ReviewsRatings } from '@/components/student/ReviewsRatings'

export function UnifiedStudentDashboard() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  console.log('UnifiedStudentDashboard render:', { user: !!user, profile: !!profile, loading })

  // Don't show loading here - let parent handle it to avoid double loading screens
  if (loading) {
    console.log('UnifiedStudentDashboard still loading, showing spinner')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
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

      const [enrollmentsResult, enrollmentsV2Result] = await Promise.all([
        supabase
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
          .order('enrolled_at', { ascending: false }),
        supabase
          .from('enrollments_v2')
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
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (enrollmentsResult.error) {
        console.error('Error fetching enrollments:', enrollmentsResult.error)
      }
      if (enrollmentsV2Result.error) {
        console.error('Error fetching enrollments v2:', enrollmentsV2Result.error)
      }

      const normalized = [
        ...(enrollmentsResult.data || []),
        ...(enrollmentsV2Result.data || []).map((e: any) => ({
          ...e,
          enrolled_at: e.created_at,
          progress_percentage: e.progress_percentage || 0
        }))
      ]

      return normalized
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    retry: 3
  })

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['student-stats', user?.id, enrollments.length],
    queryFn: async () => {
      if (!user?.id) {
        return {
          totalCourses: 0,
          completedCourses: 0,
          inProgressCourses: 0,
          totalHours: 0,
          averageProgress: 0,
          totalBookmarks: 0,
          totalCertificates: 0,
          streakDays: 0,
          weeklyGoal: 80,
          monthlyGoal: 320
        }
      }

      // Get bookmarks
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('user_id', user.id)

      // Get certificates
      const { data: certificates } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)

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
        averageProgress,
        totalBookmarks: bookmarks?.length || 0,
        totalCertificates: certificates?.length || 0,
        streakDays: 12,
        weeklyGoal: 80,
        monthlyGoal: 320
      }
    },
    enabled: !!user?.id
  })

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: 10 })
      if (error) throw error
      return data || []
    }
  })

  const { data: upcomingEvents } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      // Mock data for upcoming events
      return [
        { id: 1, title: 'Live Webinar: Advanced Mathematics', date: '2024-07-05', time: '15:00' },
        { id: 2, title: 'Assignment Deadline: Physics Lab', date: '2024-07-07', time: '23:59' },
        { id: 3, title: 'Group Study Session', date: '2024-07-08', time: '18:00' }
      ]
    }
  })

  const isDataLoading = enrollmentsLoading || statsLoading

  if (isDataLoading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="animate-pulse">
          <div className="h-24 md:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 md:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="h-48 md:h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const statsCards = []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="space-y-4 md:space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <Card className="bg-gradient-to-r from-[#00CFFF] to-blue-600 text-white">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border-4 border-white/20">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-white/20 text-white font-bold text-xl">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold mb-2">
                    Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Student'}! 🎓
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base">
                    Continue your learning journey and achieve your goals
                  </p>
                </div>
              </div>
              <div className="text-center md:text-right">
                <div className="text-2xl md:text-3xl font-bold">{profile?.points || 0}</div>
                <div className="text-xs md:text-sm text-blue-100">Total Points</div>
                <Badge className="bg-white/20 text-white border-white/30 mt-2">
                  Level {profile?.level || 1}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Quick Actions - Now functional */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200"
            onClick={() => alert('Downloads feature coming soon!')}
          >
            <CardContent className="p-4 text-center">
              <Download className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold text-sm">Downloads</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Course materials</p>
            </CardContent>
          </Card>
          
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 border-pink-200"
            onClick={() => alert('Support feature coming soon! Please contact us at support@sulphuricbench.com')}
          >
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-pink-600" />
              <h3 className="font-semibold text-sm">Support</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get help</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-fit bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs">Overview</TabsTrigger>
            <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs">My Courses</TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs">Payments</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs">Profile</TabsTrigger>
            <TabsTrigger value="reviews" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs">Reviews</TabsTrigger>
            <TabsTrigger value="browse" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs">Browse</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <DashboardOverview />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentHistory />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <ProfileManagement />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <ReviewsRatings />
          </TabsContent>

          <TabsContent value="courses" className="space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-lg md:text-xl font-semibold">Continue Learning</h2>
              <Button onClick={() => navigate('/')} variant="outline" className="text-xs md:text-sm w-full md:w-auto">
                Browse More Courses
              </Button>
            </div>
            
            {enrollments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {enrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20"
                        onClick={() => navigate(`/course/${enrollment.courses?.id}/content`)}>
                    <div className="aspect-video relative overflow-hidden rounded-t-lg">
                      <img
                        src={enrollment.courses?.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'}
                        alt={enrollment.courses?.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                          <Play className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      </div>
                      <Badge className="absolute top-2 right-2 bg-blue-600 text-xs">
                        {enrollment.progress_percentage || 0}% Complete
                      </Badge>
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
                          
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs">4.8</span>
                          </div>
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
          </TabsContent>

          <TabsContent value="browse" className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Featured Courses</h2>
              <CourseSlider />
            </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
