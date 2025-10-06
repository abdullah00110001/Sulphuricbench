
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/integrations/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { 
  UserPlus, 
  BookOpen, 
  MessageSquare, 
  Award, 
  LogIn,
  FileText,
  Users,
  Activity
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: string
  message: string
  user_name: string
  user_avatar?: string
  created_at: string
  metadata?: any
}

export function RecentActivity() {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      // Get recent activities from multiple sources
      const [
        { data: newUsers },
        { data: newCourses },
        { data: newBlogs },
        { data: newEnrollments },
        { data: newCertificates }
      ] = await Promise.all([
        // New user registrations
        supabase
          .from('profiles')
          .select('id, full_name, avatar_url, created_at, role')
          .order('created_at', { ascending: false })
          .limit(5),
        
        // New courses
        supabase
          .from('courses')
          .select(`
            id, title, created_at,
            profiles:instructor_id(full_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // New blogs
        supabase
          .from('blogs')
          .select(`
            id, title, created_at,
            profiles:author_id(full_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
        
        // New enrollments
        supabase
          .from('enrollments')
          .select(`
            id, enrolled_at,
            profiles:student_id(full_name, avatar_url),
            courses:course_id(title)
          `)
          .order('enrolled_at', { ascending: false })
          .limit(5),
        
        // New certificates
        supabase
          .from('certificates')
          .select(`
            id, issued_at,
            profiles:user_id(full_name, avatar_url),
            courses:course_id(title)
          `)
          .order('issued_at', { ascending: false })
          .limit(3)
      ])

      const activities: ActivityItem[] = []

      // Process new users
      newUsers?.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_registration',
          message: `New ${user.role} registered`,
          user_name: user.full_name || 'Unknown User',
          user_avatar: user.avatar_url,
          created_at: user.created_at,
          metadata: { role: user.role }
        })
      })

      // Process new courses
      newCourses?.forEach(course => {
        activities.push({
          id: `course-${course.id}`,
          type: 'course_created',
          message: `New course "${course.title}" created`,
          user_name: course.profiles?.full_name || 'Unknown Instructor',
          user_avatar: course.profiles?.avatar_url,
          created_at: course.created_at,
          metadata: { course_title: course.title }
        })
      })

      // Process new blogs
      newBlogs?.forEach(blog => {
        activities.push({
          id: `blog-${blog.id}`,
          type: 'blog_posted',
          message: `New blog "${blog.title}" posted`,
          user_name: blog.profiles?.full_name || 'Unknown Author',
          user_avatar: blog.profiles?.avatar_url,
          created_at: blog.created_at,
          metadata: { blog_title: blog.title }
        })
      })

      // Process new enrollments
      newEnrollments?.forEach(enrollment => {
        activities.push({
          id: `enrollment-${enrollment.id}`,
          type: 'course_enrollment',
          message: `Enrolled in "${enrollment.courses?.title}"`,
          user_name: enrollment.profiles?.full_name || 'Unknown Student',
          user_avatar: enrollment.profiles?.avatar_url,
          created_at: enrollment.enrolled_at,
          metadata: { course_title: enrollment.courses?.title }
        })
      })

      // Process new certificates
      newCertificates?.forEach(certificate => {
        activities.push({
          id: `certificate-${certificate.id}`,
          type: 'certificate_issued',
          message: `Certificate issued for "${certificate.courses?.title}"`,
          user_name: certificate.profiles?.full_name || 'Unknown Student',
          user_avatar: certificate.profiles?.avatar_url,
          created_at: certificate.issued_at,
          metadata: { course_title: certificate.courses?.title }
        })
      })

      // Sort all activities by date and return top 10
      return activities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)
    }
  })

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-4 w-4 text-blue-600" />
      case 'course_created':
        return <BookOpen className="h-4 w-4 text-green-600" />
      case 'blog_posted':
        return <MessageSquare className="h-4 w-4 text-purple-600" />
      case 'course_enrollment':
        return <Users className="h-4 w-4 text-orange-600" />
      case 'certificate_issued':
        return <Award className="h-4 w-4 text-yellow-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (type: string, metadata?: any) => {
    switch (type) {
      case 'user_registration':
        return (
          <Badge variant={metadata?.role === 'teacher' ? 'default' : 'secondary'}>
            {metadata?.role === 'teacher' ? 'Teacher' : 'Student'}
          </Badge>
        )
      case 'course_created':
        return <Badge className="bg-green-100 text-green-800">Course</Badge>
      case 'blog_posted':
        return <Badge className="bg-purple-100 text-purple-800">Blog</Badge>
      case 'course_enrollment':
        return <Badge className="bg-orange-100 text-orange-800">Enrollment</Badge>
      case 'certificate_issued':
        return <Badge className="bg-yellow-100 text-yellow-800">Certificate</Badge>
      default:
        return <Badge variant="outline">Activity</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse">
            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Recent Activities</h3>
        <p className="text-gray-600">Platform activities will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div
          key={activity.id}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            {getActivityIcon(activity.type)}
            <Avatar className="h-8 w-8">
              <AvatarImage src={activity.user_avatar} />
              <AvatarFallback>
                {activity.user_name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{activity.message}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                by {activity.user_name} • {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          {getStatusBadge(activity.type, activity.metadata)}
        </div>
      ))}
    </div>
  )
}
