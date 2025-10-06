
import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Users, Clock, Star, BookOpen, Eye, Edit, Trash2 } from 'lucide-react'
import { coursesApi } from '@/apis/courses'
import { CourseActions } from './CourseActions'

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  price: number
  is_published: boolean
  is_featured: boolean
  total_students: number
  duration_hours: number
  difficulty_level: string
  instructor_name?: string
  category_name?: string
  category_id?: string
  course_categories?: {
    name: string
    color: string
  }
  profiles?: {
    full_name: string
  }
  enrollment_count: number
}

export function CourseManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [difficultyFilter, setDifficultyFilter] = useState('all')

  const { data: courses, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      console.log('Fetching admin courses...')
      try {
        const data = await coursesApi.getAllCourses()
        console.log('Admin courses fetched:', data)
        
        // Transform the data to match our interface
        return data.map((course: any) => ({
          id: course.id,
          title: course.title,
          description: course.description || '',
          thumbnail_url: course.thumbnail_url,
          price: Number(course.price) || 0,
          is_published: Boolean(course.is_published),
          is_featured: Boolean(course.is_featured),
          total_students: Number(course.total_students) || 0,
          duration_hours: Number(course.duration_hours) || 0,
          difficulty_level: course.difficulty_level || 'beginner',
          instructor_name: course.profiles?.full_name || 'Unknown Instructor',
          category_name: course.course_categories?.name || 'Uncategorized',
          category_id: course.category_id,
          enrollment_count: Number(course.total_students) || 0
        }))
      } catch (err) {
        console.error('Error fetching admin courses:', err)
        throw err
      }
    }
  })

  const handleRefresh = () => {
    console.log('Refreshing courses...')
    refetch()
  }

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && course.is_published) ||
                         (statusFilter === 'draft' && !course.is_published) ||
                         (statusFilter === 'featured' && course.is_featured)
    
    const matchesDifficulty = difficultyFilter === 'all' || course.difficulty_level === difficultyFilter
    
    return matchesSearch && matchesStatus && matchesDifficulty
  }) || []

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Courses</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load courses'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRefresh} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="featured">Featured</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses?.filter(c => c.is_published).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses?.filter(c => c.is_featured).length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses?.reduce((sum, c) => sum + c.total_students, 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== 'all' || difficultyFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first course to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Course Image */}
              <div className="aspect-video overflow-hidden">
                <img
                  src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                  <div className="flex gap-1 flex-wrap">
                    {course.is_published && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Published
                      </Badge>
                    )}
                    {course.is_featured && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        Featured
                      </Badge>
                    )}
                    {!course.is_published && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Instructor:</span>
                    <span className="font-medium">{course.instructor_name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span>{course.category_name}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-semibold">৳{course.price.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.total_students} students</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_hours}h</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Difficulty:</span>
                    <Badge 
                      variant="outline" 
                      className={
                        course.difficulty_level === 'beginner' ? 'border-green-200 text-green-700' :
                        course.difficulty_level === 'intermediate' ? 'border-yellow-200 text-yellow-700' :
                        'border-red-200 text-red-700'
                      }
                    >
                      {course.difficulty_level}
                    </Badge>
                  </div>

                  {/* Action Buttons - This is the key fix! */}
                  <div className="pt-2 border-t">
                    <CourseActions course={course} onRefresh={handleRefresh} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
