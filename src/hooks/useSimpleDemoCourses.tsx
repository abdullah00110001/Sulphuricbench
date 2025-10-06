
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export const useSimpleDemoCourses = () => {
  const queryClient = useQueryClient()

  const createDemoCoursesmutation = useMutation({
    mutationFn: async () => {
      console.log('Creating enhanced demo courses with categories and teachers...')
      
      // First, get categories
      const { data: categories } = await supabase
        .from('course_categories')
        .select('id, name')

      // Create some demo teachers first
      const demoTeachers = [
        {
          full_name: 'Dr. Apurbo Mashrur',
          email: 'apurbo@sulphuricbench.com',
          phone: '+880 1711-123456',
          bio: 'Expert Physics teacher with 15+ years of experience in HSC and Admission preparation.',
          qualifications: 'PhD in Physics, MSc in Applied Physics',
          experience_years: 15,
          avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
          full_name: 'Prof. Rashida Khatun',
          email: 'rashida@sulphuricbench.com',
          phone: '+880 1811-234567',
          bio: 'Renowned Chemistry educator specializing in HSC and Medical admission preparation.',
          qualifications: 'MSc in Chemistry, BSc in Chemistry (Hons)',
          experience_years: 12,
          avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b6d4ea57?w=150&h=150&fit=crop&crop=face'
        },
        {
          full_name: 'Md. Karim Hassan',
          email: 'karim@sulphuricbench.com',
          phone: '+880 1911-345678',
          bio: 'Mathematics expert with deep knowledge in SSC, HSC, and Engineering admission prep.',
          qualifications: 'MSc in Mathematics, BSc in Mathematics',
          experience_years: 10,
          avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
      ]

      // Insert teachers
      const { data: teachersData } = await supabase
        .from('teachers')
        .upsert(demoTeachers, { onConflict: 'email' })
        .select()

      // Find category IDs
      const sscCategory = categories?.find(c => c.name === 'SSC')
      const hscCategory = categories?.find(c => c.name === 'HSC')
      const admissionCategory = categories?.find(c => c.name === 'Admission')

      const demoCourses = [
        {
          title: 'ACS HSC 27 Higher Math Academic Cycle',
          description: 'HSC ২৭ ব্যাচের উচ্চতর গণিত একাডেমিক সাইকেল। এই কোর্সে তুমি পাবে সম্পূর্ণ HSC সিলেবাস কভার।',
          price: 10000,
          difficulty_level: 'advanced',
          thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
          is_published: true,
          is_featured: true,
          total_students: 1580,
          duration_hours: 200,
          category_id: hscCategory?.id || null,
          teacher_id: teachersData?.[2]?.id || null
        },
        {
          title: 'ACS Physics HSC 27 By Apurbo Mashrur',
          description: 'HSC ২৭ ব্যাচের জন্য সম্পূর্ণ পদার্থবিজ্ঞান কোর্স। অভিজ্ঞ শিক্ষক অপূর্ব মাশরুর এর তত্ত্বাবধানে।',
          price: 10000,
          difficulty_level: 'intermediate',
          thumbnail_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=250&fit=crop',
          is_published: true,
          is_featured: true,
          total_students: 1425,
          duration_hours: 180,
          category_id: hscCategory?.id || null,
          teacher_id: teachersData?.[0]?.id || null
        },
        {
          title: 'HSC Chemistry 1st Paper - Complete Course',
          description: 'HSC রসায়ন ১ম পত্র সম্পূর্ণ কোর্স। মেডিকেল ভর্তি পরীক্ষার জন্য বিশেষভাবে প্রস্তুতকৃত।',
          price: 8500,
          difficulty_level: 'intermediate',
          thumbnail_url: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=250&fit=crop',
          is_published: true,
          is_featured: false,
          total_students: 890,
          duration_hours: 150,
          category_id: hscCategory?.id || null,
          teacher_id: teachersData?.[1]?.id || null
        },
        {
          title: 'SSC Mathematics Foundation Course',
          description: 'SSC গণিত ভিত্তি কোর্স। শক্তিশালী ভিত্তি তৈরির জন্য সম্পূর্ণ সিলেবাস কভার।',
          price: 5000,
          difficulty_level: 'beginner',
          thumbnail_url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=250&fit=crop',
          is_published: true,
          is_featured: false,
          total_students: 650,
          duration_hours: 120,
          category_id: sscCategory?.id || null,
          teacher_id: teachersData?.[2]?.id || null
        },
        {
          title: 'Medical Admission Chemistry Preparation',
          description: 'মেডিকেল ভর্তি পরীক্ষার জন্য বিশেষ রসায়ন প্রস্তুতি কোর্স। সর্বোচ্চ নম্বর পাওয়ার কৌশল।',
          price: 12000,
          difficulty_level: 'advanced',
          thumbnail_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=250&fit=crop',
          is_published: true,
          is_featured: true,
          total_students: 420,
          duration_hours: 180,
          category_id: admissionCategory?.id || null,
          teacher_id: teachersData?.[1]?.id || null
        },
        {
          title: 'Engineering Admission Mathematics',
          description: 'ইঞ্জিনিয়ারিং ভর্তি পরীক্ষার জন্য উচ্চতর গণিত কোর্স। BUET, RUET সহ সকল বিশ্ববিদ্যালয়ের জন্য।',
          price: 11000,
          difficulty_level: 'advanced',
          thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop',
          is_published: true,
          is_featured: false,
          total_students: 380,
          duration_hours: 200,
          category_id: admissionCategory?.id || null,
          teacher_id: teachersData?.[2]?.id || null
        }
      ]

      const { data, error } = await supabase
        .from('courses')
        .insert(demoCourses)
        .select()

      if (error) {
        throw new Error(`Failed to create demo courses: ${error.message}`)
      }

      console.log('Enhanced demo courses created successfully:', data)
      return data
    },
    onSuccess: () => {
      console.log('Demo courses created, refreshing all queries...')
      queryClient.invalidateQueries({ queryKey: ['simple-featured-courses'] })
      queryClient.invalidateQueries({ queryKey: ['featured-courses-section'] })
      queryClient.invalidateQueries({ queryKey: ['categorized-courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    }
  })

  const checkAndCreateDemoCourses = async () => {
    console.log('Checking if demo courses exist...')
    
    const { data: existingCourses } = await supabase
      .from('courses')
      .select('id')
      .eq('is_published', true)
      .limit(1)

    if (!existingCourses || existingCourses.length === 0) {
      console.log('No courses found, creating demo courses...')
      return createDemoCoursesmutation.mutateAsync()
    }
    
    console.log('Demo courses already exist')
    return existingCourses
  }

  return {
    createDemoCourses: createDemoCoursesmutation.mutate,
    checkAndCreateDemoCourses,
    isCreating: createDemoCoursesmutation.isPending
  }
}
