
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface Teacher {
  id: string
  full_name: string
  email?: string
  bio?: string
  qualifications?: string
  specializations?: string[]
  experience_years?: number
  institution?: string
  image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async (): Promise<Teacher[]> => {
      console.log('Fetching teachers...')
      
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('full_name')

      if (error) {
        console.error('Error fetching teachers:', error)
        throw new Error(`Failed to fetch teachers: ${error.message}`)
      }

      console.log('Teachers fetched:', data)
      return data || []
    }
  })
}
