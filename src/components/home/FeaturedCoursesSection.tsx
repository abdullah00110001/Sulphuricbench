
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Star, BookOpen, Play } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'

export function FeaturedCoursesSection() {
  const navigate = useNavigate()

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['featured-courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id(full_name, avatar_url, bio),
          enrollments(id),
          course_ratings(rating),
          course_modules(id, title, duration_minutes, order_index)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(8)

      if (error) {
        console.error('Error fetching courses:', error)
        return []
      }

      return data?.map(course => ({
        ...course,
        enrollmentCount: course.enrollments?.length || 0,
        averageRating: course.course_ratings?.length 
          ? (course.course_ratings.reduce((sum: number, r: any) => sum + r.rating, 0) / course.course_ratings.length).toFixed(1)
          : 0,
        instructorName: course.profiles?.full_name || 'Unknown Instructor',
        // Calculate actual total duration from modules
        totalDuration: course.course_modules?.reduce((sum: number, module: any) => sum + (module.duration_minutes || 0), 0) || course.duration_hours * 60 || 0,
        moduleCount: course.course_modules?.length || 0,
        // Use duration_hours if available, otherwise calculate from modules
        displayHours: course.duration_hours || Math.round((course.course_modules?.reduce((sum: number, module: any) => sum + (module.duration_minutes || 0), 0) || 0) / 60)
      })) || []
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    refetchOnWindowFocus: true
  })

  const handleViewDetails = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-16">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-80"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 xl:px-8 2xl:px-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Featured <span className="text-gradient bg-gradient-to-r from-[#00CFFF] to-blue-600 bg-clip-text text-transparent">Courses</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover our comprehensive collection of courses designed to help you achieve your educational goals
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 overflow-hidden"
            >
              <div className="aspect-video overflow-hidden relative">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#00CFFF]/20 to-blue-600/20 flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-[#00CFFF]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {course.is_featured && (
                  <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600 text-white border-0">
                    Popular
                  </Badge>
                )}
              </div>
              
              <CardHeader className="pb-2 p-4 lg:p-6">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-base sm:text-lg font-semibold line-clamp-2 flex-1 text-gray-900 dark:text-white">
                    {course.title}
                  </CardTitle>
                </div>
                
                <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0 p-4 lg:p-6">
                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{course.enrollmentCount}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.displayHours}h</span>
                  </div>
                  
                  {Number(course.averageRating) > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{course.averageRating}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-bold text-[#00CFFF]">
                    {Number(course.price) > 0 ? `৳${course.price}` : 'Free'}
                  </div>
                  
                  <Badge variant="outline" className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                    {course.difficulty_level}
                  </Badge>
                </div>

                <div className="mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    By {course.instructorName}
                  </p>
                  {course.moduleCount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {course.moduleCount} modules
                    </p>
                  )}
                </div>

                <Button 
                  onClick={() => handleViewDetails(course.id)}
                  className="w-full bg-[#00CFFF] hover:bg-[#00B8E6] text-white transition-all duration-300 transform hover:scale-105 text-sm"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">No Courses Available</h3>
            <p className="text-gray-500 dark:text-gray-500">Courses will appear here once they are published by administrators.</p>
          </div>
        )}
      </div>
    </section>
  )
}
