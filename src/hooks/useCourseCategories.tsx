
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface CourseCategory {
  id: string
  name: string
  description?: string
  color?: string
}

export function useCourseCategories() {
  return useQuery({
    queryKey: ['course-categories'],
    queryFn: async (): Promise<CourseCategory[]> => {
      console.log('Fetching course categories...')
      
      const { data, error } = await supabase
        .from('course_categories')
        .select('id, name, description, color')
        .order('name')

      if (error) {
        console.error('Error fetching course categories:', error)
        throw new Error(`Failed to fetch course categories: ${error.message}`)
      }

      console.log('Course categories fetched:', data)
      return data || []
    }
  })
}
