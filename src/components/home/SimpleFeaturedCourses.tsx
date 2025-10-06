
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Users, Clock, BookOpen } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export function SimpleFeaturedCourses() {
  // Ultra simple query with more frequent refetch
  const { data: featuredCourses = [], isLoading, refetch } = useQuery({
    queryKey: ['simple-featured-courses'],
    queryFn: async () => {
      console.log('Fetching ultra simple courses...')
      
      const { data: courses, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error fetching courses:', error)
        throw error
      }

      console.log('Ultra simple courses fetched:', courses)
      return courses || []
    },
    retry: 1,
    refetchInterval: 5000, // Refetch every 5 seconds
    refetchOnWindowFocus: true
  })

  // Auto-refresh when component mounts
  React.useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 3000) // Refresh every 3 seconds

    return () => clearInterval(interval)
  }, [refetch])

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover our most popular courses
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!featuredCourses.length) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover our most popular courses
            </p>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
              <p className="text-muted-foreground">
                Courses will appear here once they are created and published.
              </p>
              <Button 
                onClick={() => refetch()} 
                className="mt-4"
                variant="outline"
              >
                Refresh Courses
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Courses</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Discover our most popular courses
          </p>
          <Button 
            onClick={() => refetch()} 
            className="mt-2"
            variant="ghost"
            size="sm"
          >
            🔄 Refresh
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-2 right-2 bg-blue-600">
                  {course.difficulty_level || 'Beginner'}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl mb-2 line-clamp-2">
                    {course.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {course.description || 'No description available'}
                  </CardDescription>
                </CardHeader>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{course.total_students || 0} students</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>4.5</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration_hours || 0}h</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    by Instructor
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    ৳{course.price || 0}
                  </div>
                </div>
                
                <Button className="w-full mt-4" size="lg">
                  Enroll Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Courses
          </Button>
        </div>
      </div>
    </section>
  )
}
