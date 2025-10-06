
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Star, Users, Clock, BookOpen, User } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export function CategoryBasedCourses() {
  const { data: categorizedCourses = [], isLoading } = useQuery({
    queryKey: ['categorized-courses'],
    queryFn: async () => {
      console.log('Fetching categorized courses...')
      
      const { data: courses, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories(id, name, color),
          teachers(id, full_name, avatar_url, bio)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching categorized courses:', error)
        throw error
      }

      // Group courses by category
      const groupedCourses = courses?.reduce((acc: any, course: any) => {
        const categoryName = course.course_categories?.name || 'Uncategorized'
        if (!acc[categoryName]) {
          acc[categoryName] = {
            category: course.course_categories,
            courses: []
          }
        }
        acc[categoryName].courses.push(course)
        return acc
      }, {}) || {}

      console.log('Categorized courses:', groupedCourses)
      return groupedCourses
    },
    retry: 1
  })

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#00CFFF]">Explore Categories</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your preparation path
            </p>
          </div>
          <div className="space-y-12">
            {['SSC', 'HSC', 'Admission'].map((category) => (
              <div key={category} className="animate-pulse">
                <h3 className="text-2xl font-bold mb-6 text-[#00CFFF]">{category}</h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i}>
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
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Filter out categories with no courses
  const categoriesWithCourses = Object.entries(categorizedCourses).filter(
    ([_, data]: [string, any]) => data.courses && data.courses.length > 0
  )

  if (categoriesWithCourses.length === 0) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-[#00CFFF]">Explore Categories</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Choose your preparation path
            </p>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Available</h3>
              <p className="text-muted-foreground">
                Courses will appear here once they are created and published.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[#00CFFF]">Explore Categories</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your preparation path
          </p>
        </div>
        
        <div className="space-y-16">
          {categoriesWithCourses.map(([categoryName, data]: [string, any]) => (
            <div key={categoryName}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-[#00CFFF]">{categoryName}</h3>
                <Badge 
                  className="bg-[#00CFFF] text-white hover:bg-[#00B8E6]"
                >
                  {data.courses.length} Course{data.courses.length !== 1 ? 's' : ''}
                </Badge>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.courses.map((course: any) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-[#00CFFF]">
                    <div className="relative">
                      <img
                        src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                        alt={course.title}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-[#00CFFF] hover:bg-[#00B8E6]">
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
                      
                      {course.teachers && (
                        <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          {course.teachers.avatar_url ? (
                            <img
                              src={course.teachers.avatar_url}
                              alt={course.teachers.full_name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-[#00CFFF] rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{course.teachers.full_name}</p>
                            <p className="text-xs text-muted-foreground">Instructor</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{course.total_students || 0} students</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span>4.8</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_hours || 0}h</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-2xl font-bold text-[#00CFFF]">
                          ৳{course.price || 0}
                        </div>
                        {course.is_featured && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <Button className="w-full bg-[#00CFFF] hover:bg-[#00B8E6]" size="lg">
                        Enroll Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
