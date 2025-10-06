
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, GraduationCap, TrendingUp } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export function ContentOverview() {
  const { data: courseStats, isLoading } = useQuery({
    queryKey: ['course-stats'],
    queryFn: async () => {
      const { data: courses, error } = await supabase
        .from('courses')
        .select('id, is_published, total_students')

      if (error) throw error

      const stats = {
        totalCourses: courses?.length || 0,
        publishedCourses: courses?.filter(course => course.is_published).length || 0,
        draftCourses: courses?.filter(course => !course.is_published).length || 0,
        totalEnrollments: courses?.reduce((sum, course) => sum + (course.total_students || 0), 0) || 0
      }

      return stats
    }
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Content Overview</CardTitle>
          <CardDescription>Course statistics and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Loading course statistics...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Overview</CardTitle>
        <CardDescription>Course statistics and metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-blue-600">{courseStats?.totalCourses || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="p-2 bg-green-100 rounded-full">
              <GraduationCap className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-green-600">{courseStats?.publishedCourses || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
            <div className="p-2 bg-yellow-100 rounded-full">
              <BookOpen className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-2xl font-bold text-yellow-600">{courseStats?.draftCourses || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
            <div className="p-2 bg-purple-100 rounded-full">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Enrollments</p>
              <p className="text-2xl font-bold text-purple-600">{courseStats?.totalEnrollments || 0}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
