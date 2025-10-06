
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/integrations/supabase/client'

interface Course {
  id: string
  title: string
  instructor_name: string
  thumbnail_url: string | null
  price: number
  category_name: string | null
}

export function CourseSlider() {
  const [courses, setCourses] = useState<Course[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [itemsPerView, setItemsPerView] = useState(4)

  useEffect(() => {
    fetchCourses()
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleResize = () => {
    const width = window.innerWidth
    if (width < 640) {
      setItemsPerView(1)
    } else if (width < 768) {
      setItemsPerView(2)
    } else if (width < 1024) {
      setItemsPerView(3)
    } else {
      setItemsPerView(4)
    }
  }

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          thumbnail_url,
          price,
          instructor:profiles!instructor_id(full_name)
        `)
        .eq('is_published', true)
        .limit(10)

      if (error) throw error
      
      const coursesData = data?.map(course => ({
        id: course.id,
        title: course.title,
        instructor_name: course.instructor?.full_name || 'Unknown',
        thumbnail_url: course.thumbnail_url,
        price: course.price || 0,
        category_name: null
      })) || []
      
      setCourses(coursesData)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    const maxIndex = Math.max(0, courses.length - itemsPerView)
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    const maxIndex = Math.max(0, courses.length - itemsPerView)
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  if (loading) {
    return (
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 sm:gap-6 overflow-hidden">
          {[...Array(itemsPerView)].map((_, i) => (
            <Card key={i} className="flex-shrink-0 w-full sm:w-80 animate-pulse">
              <div className="h-48 sm:h-64 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 sm:p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Mock data if no courses available
  const mockCourses = [
    {
      id: '1',
      title: 'Robotic Fundamentals',
      instructor_name: 'Sarah Johnson',
      thumbnail_url: '/placeholder.svg',
      price: 89,
      category_name: 'Robotics'
    },
    {
      id: '2',
      title: 'Advanced AI Programming',
      instructor_name: 'Dr. Michael Chen',
      thumbnail_url: '/placeholder.svg',
      price: 129,
      category_name: 'AI & Machine Learning'
    },
    {
      id: '3',
      title: 'Web Development Mastery',
      instructor_name: 'Emma Rodriguez',
      thumbnail_url: '/placeholder.svg',
      price: 79,
      category_name: 'Web Development'
    },
    {
      id: '4',
      title: 'Data Science Bootcamp',
      instructor_name: 'Prof. Alex Kumar',
      thumbnail_url: '/placeholder.svg',
      price: 149,
      category_name: 'Data Science'
    },
    {
      id: '5',
      title: 'Mobile App Development',
      instructor_name: 'Lisa Thompson',
      thumbnail_url: '/placeholder.svg',
      price: 99,
      category_name: 'Mobile Development'
    }
  ]

  const displayCourses = courses.length > 0 ? courses : mockCourses
  const maxIndex = Math.max(0, displayCourses.length - itemsPerView)

  return (
    <div className="relative w-full px-4 sm:px-6 lg:px-8">
      <div className="flex items-center">
        {/* Previous Button */}
        {displayCourses.length > itemsPerView && (
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}

        {/* Course Cards Container */}
        <div className="overflow-hidden w-full mx-8 sm:mx-12">
          <div 
            className="flex gap-4 sm:gap-6 transition-transform duration-300 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
              width: `${(displayCourses.length / itemsPerView) * 100}%`
            }}
          >
            {displayCourses.map((course, index) => (
              <Card 
                key={course.id || index} 
                className="flex-shrink-0 rounded-3xl shadow-2xl border-0 overflow-hidden hover:scale-105 transition-transform duration-300"
                style={{ width: `${100 / displayCourses.length}%` }}
              >
                <div className="relative h-48 sm:h-64 overflow-hidden">
                  <img
                    src={course.thumbnail_url || '/placeholder.svg'}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 backdrop-blur-sm rounded-full px-2 sm:px-3 py-1">
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                      ${course.price}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <User className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">by {course.instructor_name}</span>
                  </div>
                  
                  <h3 className="font-bold text-sm sm:text-lg text-gray-900 mb-3 line-clamp-2">
                    {course.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2 sm:mb-0">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                        4.9
                      </span>
                      <span className="text-gray-500 text-xs">
                        (2100)
                      </span>
                    </div>
                    
                    <span className="text-lg sm:text-2xl font-bold text-blue-600">
                      ${course.price}
                    </span>
                  </div>
                  
                  {course.category_name && (
                    <div className="mt-2 sm:mt-3">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {course.category_name}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Button */}
        {displayCourses.length > itemsPerView && (
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg hover:bg-gray-50 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        )}
      </div>

      {/* Dot indicators for mobile */}
      {displayCourses.length > itemsPerView && (
        <div className="flex justify-center mt-4 gap-2 sm:hidden">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentIndex === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
