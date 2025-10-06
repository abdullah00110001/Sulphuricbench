
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Users, Star, BookOpen, Search, Filter, Play } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Courses() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          profiles:instructor_id(full_name, avatar_url, bio),
          enrollments(id),
          course_ratings(rating),
          course_modules(id, title, duration_minutes, order_index),
          course_categories(name)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

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
        totalDuration: course.course_modules?.reduce((sum: number, module: any) => sum + (module.duration_minutes || 0), 0) || 0,
        moduleCount: course.course_modules?.length || 0,
        categoryName: course.course_categories?.name || 'Uncategorized',
        displayHours: course.duration_hours || Math.round(((course.course_modules?.reduce((sum: number, module: any) => sum + (module.duration_minutes || 0), 0) || 0) / 60)) || 0
      })) || []
    }
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        return []
      }

      return data || []
    }
  })

  const handleViewDetails = (courseId: string) => {
    console.log('Navigating to course:', courseId)
    navigate(`/course/${courseId}`)
  }

  // Filter and sort courses
  const filteredCourses = courses
    .filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructorName.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || course.categoryName === selectedCategory
      const matchesLevel = selectedLevel === 'all' || course.difficulty_level === selectedLevel
      
      return matchesSearch && matchesCategory && matchesLevel
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'popular':
          return b.enrollmentCount - a.enrollmentCount
        case 'rating':
          return Number(b.averageRating) - Number(a.averageRating)
        case 'price-low':
          return Number(a.price) - Number(b.price)
        case 'price-high':
          return Number(b.price) - Number(a.price)
        default:
          return 0
      }
    })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 xl:px-8 2xl:px-16">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-80"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 xl:px-8 2xl:px-16">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            All <span className="text-gradient bg-gradient-to-r from-[#00CFFF] to-blue-600 bg-clip-text text-transparent">Courses</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our comprehensive collection of courses and start your learning journey today
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredCourses.length} of {courses.length} courses
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="group hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden"
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
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 text-gray-900 dark:text-white">
                    {course.title}
                  </CardTitle>
                </div>
                
                <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {course.categoryName} • {course.moduleCount} modules
                  </p>
                </div>

                <Button 
                  onClick={() => handleViewDetails(course.id)}
                  className="w-full bg-[#00CFFF] hover:bg-[#00B8E6] text-white transition-all duration-300 transform hover:scale-105"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              {searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' 
                ? 'No courses found matching your criteria' 
                : 'No Courses Available'
              }
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              {searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Courses will appear here once they are published by administrators.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
