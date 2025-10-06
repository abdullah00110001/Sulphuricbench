
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { BookOpen, Star, Clock, Users, ArrowRight, Search, Filter } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export function BrowseCourses() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const { data: courses, isLoading } = useQuery({
    queryKey: ['browse-courses'],
    queryFn: async () => {
      console.log('Fetching available courses...')

      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id(full_name, avatar_url),
          course_categories(name, color)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching courses:', error)
        throw error
      }

      return data || []
    }
  })

  const { data: enrolledCourses } = useQuery({
    queryKey: ['enrolled-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('enrollments')
        .select('course_id')
        .eq('student_id', user.id)

      if (error) throw error
      return data?.map(e => e.course_id) || []
    },
    enabled: !!user?.id
  })

  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleEnrollClick = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  const isEnrolled = (courseId: string) => {
    return enrolledCourses?.includes(courseId) || false
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Browse Courses</h2>
          <p className="text-muted-foreground">Discover new courses to enhance your skills</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Browse Courses</h2>
          <p className="text-muted-foreground">
            {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <Button onClick={() => navigate('/courses')}>
          <ArrowRight className="h-4 w-4 mr-2" />
          View All Courses
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {filteredCourses.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new courses'}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course: any) => (
            <Card 
              key={course.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => handleEnrollClick(course.id)}
            >
              <div className="aspect-video relative">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop"}
                  alt={course.title}
                  className="w-full h-full object-cover rounded-t-lg"
                />
                <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="lg" className="bg-white/90 text-black hover:bg-white">
                    View Details
                  </Button>
                </div>
                {course.course_categories && (
                  <Badge 
                    className="absolute top-2 left-2"
                    style={{ backgroundColor: course.course_categories.color }}
                  >
                    {course.course_categories.name}
                  </Badge>
                )}
                {isEnrolled(course.id) && (
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    Enrolled
                  </Badge>
                )}
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
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>4.8</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{course.total_students}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    ৳{course.price}
                  </div>
                  <Badge 
                    variant={course.difficulty_level === 'beginner' ? 'secondary' : 
                           course.difficulty_level === 'intermediate' ? 'default' : 'destructive'}
                  >
                    {course.difficulty_level}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-0">
        <CardContent className="text-center py-8">
          <h3 className="text-xl font-bold mb-2">Can't find what you're looking for?</h3>
          <p className="text-muted-foreground mb-4">
            Explore our complete course catalog with advanced filters and search options
          </p>
          <Button size="lg" onClick={() => navigate('/courses')}>
            Browse All Courses
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
