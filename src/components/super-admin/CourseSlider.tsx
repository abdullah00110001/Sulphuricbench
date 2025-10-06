
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useState } from 'react'

// Course type
interface Course {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  price: number
  duration_hours: number | null
  difficulty_level: string | null
  instructor_name: string | null
}

// Fetching future courses
const fetchFutureCourses = async (): Promise<Course[]> => {
  try {
    // Simplified query without type inference issues
    const coursesResponse = await supabase
      .from('courses')
      .select('id, title, description, thumbnail_url, price, duration_hours, difficulty_level, instructor_id')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (coursesResponse.error) {
      console.error('Error fetching courses:', coursesResponse.error)
      return []
    }

    const coursesData = coursesResponse.data || []
    
    if (!coursesData.length) {
      return []
    }

    // Extract instructor IDs
    const instructorIds = coursesData
      .map(course => course.instructor_id)
      .filter((id): id is string => Boolean(id))

    let instructorNames: Record<string, string> = {}

    if (instructorIds.length > 0) {
      const profilesResponse = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', instructorIds)

      if (!profilesResponse.error && profilesResponse.data) {
        instructorNames = profilesResponse.data.reduce((acc, profile) => {
          if (profile.id) {
            acc[profile.id] = profile.full_name || 'Unknown'
          }
          return acc
        }, {} as Record<string, string>)
      } else {
        console.error('Error fetching profiles:', profilesResponse.error)
      }
    }

    return coursesData.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url,
      price: Number(course.price) || 0,
      duration_hours: course.duration_hours,
      difficulty_level: course.difficulty_level,
      instructor_name: course.instructor_id
        ? instructorNames[course.instructor_id] || 'Unknown'
        : 'Unknown',
    }))
  } catch (error) {
    console.error('Unexpected error fetching future courses:', error)
    return []
  }
}

// Slider component
export function CourseSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const {
    data: futureCourses = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['future-courses'],
    queryFn: fetchFutureCourses,
    staleTime: 1000 * 60 * 5, // 5 min cache
  })

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % futureCourses.length)
  }

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + futureCourses.length) % futureCourses.length
    )
  }

  if (isLoading) return <p>Loading...</p>
  if (isError || !futureCourses.length)
    return <p>No future courses available.</p>

  const current = futureCourses[currentIndex]

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <Card className="overflow-hidden shadow-lg">
        {current.thumbnail_url && (
          <img
            src={current.thumbnail_url}
            alt={current.title}
            className="w-full h-48 object-cover"
          />
        )}
        <CardContent className="p-4 space-y-2">
          <h2 className="text-xl font-semibold">{current.title}</h2>
          <p className="text-sm text-muted-foreground">
            {current.description?.slice(0, 100) || 'No description.'}
          </p>
          <div className="flex flex-wrap gap-2 items-center text-xs">
            <Badge>
              <User className="w-3 h-3 mr-1" /> {current.instructor_name}
            </Badge>
            {current.duration_hours && (
              <Badge>
                <Clock className="w-3 h-3 mr-1" />
                {current.duration_hours} hrs
              </Badge>
            )}
            {current.difficulty_level && (
              <Badge>{current.difficulty_level}</Badge>
            )}
            <Badge>${current.price}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
        <Button size="icon" variant="ghost" onClick={prevSlide}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
        <Button size="icon" variant="ghost" onClick={nextSlide}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
