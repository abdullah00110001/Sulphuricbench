import { supabase } from '@/integrations/supabase/client'

export const coursesApi = {
  // Get all courses
  async getAllCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_categories(name, color),
        profiles(id, full_name, bio, avatar_url)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Get course by ID
  async getCourseById(courseId: string) {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_categories(name, color),
        profiles(id, full_name, bio, avatar_url)
      `)
      .eq('id', courseId)
      .single()

    if (error) throw error
    return data
  },

  // Create course
  async createCourse(course: any) {
    const { data, error } = await supabase
      .from('courses')
      .insert([course])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update course
  async updateCourse(courseId: string, updates: any) {
    const { data, error } = await supabase
      .from('courses')
      .update(updates)
      .eq('id', courseId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete course
  async deleteCourse(courseId: string) {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId)

    if (error) throw error
  }
}