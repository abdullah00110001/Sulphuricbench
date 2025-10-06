
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export const useDemoCourses = () => {
  const queryClient = useQueryClient()

  const createDemoCoursesmutation = useMutation({
    mutationFn: async () => {
      console.log('Creating demo courses...')
      
      const superAdminEmail = localStorage.getItem('superAdminEmail') || 'abdullahusimin1@gmail.com'
      const instructorId = 'super-admin-' + superAdminEmail.replace('@', '-').replace('.', '-')

      const demoCourses = [
        {
          title: 'ACS HSC 27 Higher Math Academic Cycle',
          description: 'HSC ২৬ ব্যাচের উচ্চতর গণিত একাডেমিক সাইকেল। এই কোর্সে তুমি পাবে সম্পূর্ণ HSC সিলেবাস কভার, সাপ্তাহিক পরীক্ষা, এবং অভিজ্ঞ শিক্ষকদের গাইডেন্স। ২০২৫, ২০২৬, ২০২৭ এবং ২০২৮ সালে এই ও তার পরের বছরের প্রশ্নের প্রতিটি অধ্যায়ের প্রশ্ন ও সমাধান পরীক্ষা হবে।',
          price: 10000,
          difficulty_level: 'advanced',
          thumbnail_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=250&fit=crop',
          is_published: true,
          instructor_id: instructorId,
          total_students: 1580,
          duration_hours: 200,
          category_id: null
        },
        {
          title: 'ACS Physics HSC 27 By Apurbo Mashrur',
          description: 'HSC ২৭ ব্যাচের জন্য সম্পূর্ণ পদার্থবিজ্ঞান কোর্স। অভিজ্ঞ শিক্ষক অপূর্ব মাশরুর এর তত্ত্বাবধানে। ১০০% সিলেবাস কভার সহ নিয়মিত পরীক্ষা। ACS এর Physics Academic Cycle এর স্পেশাল ২০২৫ ও ২০২৬ সালের ভর্তি পরীক্ষার প্রশ্ন ও সমাধান পরীক্ষা।',
          price: 10000,
          difficulty_level: 'intermediate',
          thumbnail_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&h=250&fit=crop',
          is_published: true,
          instructor_id: instructorId,
          total_students: 1425,
          duration_hours: 180,
          category_id: null
        },
        {
          title: 'ACS Chemistry HSC 27 Complete Course',
          description: 'HSC ২৭ ব্যাচের জন্য সম্পূর্ণ রসায়ন কোর্স। অভিজ্ঞ শিক্ষকদের তত্ত্বাবধানে সম্পূর্ণ সিলেবাস কভার। ল্যাব ওয়ার্ক, প্র্যাকটিক্যাল এবং তত্ত্বীয় অংশের সম্পূর্ণ প্রস্তুতি। নিয়মিত পরীক্ষা ও মূল্যায়ন।',
          price: 9500,
          difficulty_level: 'intermediate',
          thumbnail_url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=250&fit=crop',
          is_published: true,
          instructor_id: instructorId,
          total_students: 1320,
          duration_hours: 170,
          category_id: null
        },
        {
          title: 'ACS Biology HSC 27 Medical Preparation',
          description: 'মেডিকেল ভর্তি পরীক্ষার জন্য সম্পূর্ণ জীববিজ্ঞান প্রস্তুতি। HSC সিলেবাস অনুযায়ী সকল অধ্যায়ের বিস্তারিত আলোচনা। MCQ ও CQ উভয় ধরনের প্রশ্নের সমাধান। নিয়মিত মডেল টেস্ট ও পরীক্ষা।',
          price: 8500,
          difficulty_level: 'advanced',
          thumbnail_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop',
          is_published: true,
          instructor_id: instructorId,
          total_students: 1150,
          duration_hours: 160,
          category_id: null
        },
        {
          title: 'ACS English HSC 27 Complete Course',
          description: 'HSC ইংরেজি সম্পূর্ণ কোর্স। গ্রামার, লিটারেচার, কম্পোজিশন এবং ট্রান্সলেশন এর উপর বিশেষ গুরুত্ব। Creative Writing এবং Letter Writing এর বিশেষ ক্লাস। নিয়মিত প্র্যাকটিস ও পরীক্ষা।',
          price: 7000,
          difficulty_level: 'intermediate',
          thumbnail_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=250&fit=crop',
          is_published: true,
          instructor_id: instructorId,
          total_students: 980,
          duration_hours: 120,
          category_id: null
        },
        {
          title: 'ACS ICT HSC 27 Programming & Theory',
          description: 'তথ্য ও যোগাযোগ প্রযুক্তি সম্পূর্ণ কোর্স। প্রোগ্রামিং, ডেটাবেস, নেটওয়ার্কিং এবং ওয়েব ডিজাইন। প্র্যাকটিক্যাল ও তত্ত্বীয় উভয় অংশের সম্পূর্ণ প্রস্তুতি। প্রজেক্ট ওয়ার্ক এবং অ্যাসাইনমেন্ট।',
          price: 6500,
          difficulty_level: 'intermediate',
          thumbnail_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop',
          is_published: true,
          instructor_id: instructorId,
          total_students: 856,
          duration_hours: 140,
          category_id: null
        },
        {
          title: 'University Admission Special Course 2025',
          description: 'ভার্সিটি ভর্তি পরীক্ষার জন্য বিশেষ প্রস্তুতি কোর্স। সকল বিষয়ের MCQ সলভিং টেকনিক। ঢাকা বিশ্ববিদ্যালয়, বুয়েট, মেডিকেল কলেজ সহ সকল পাবলিক বিশ্ববিদ্যালয়ের ভর্তি প্রস্তুতি।',
          price: 12000,
          difficulty_level: 'advanced',
          thumbnail_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop',
          is_published: true,
          instructor_id: instructorId,
          total_students: 2340,
          duration_hours: 250,
          category_id: null
        },
        {
          title: 'SSC 2026 Math Foundation Course',
          description: 'SSC ২০২৬ ব্যাচের জন্য গণিত ফাউন্ডেশন কোর্স। মৌলিক গণিত থেকে শুরু করে উচ্চতর গণিতের প্রাথমিক ধারণা। দুর্বল ছাত্রছাত্রীদের জন্য বিশেষভাবে ডিজাইন করা। ধাপে ধাপে শেখার ব্যবস্থা।',
          price: 4500,
          difficulty_level: 'beginner',
          thumbnail_url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&h=250&fit=crop',
          is_published: true,
          instructor_id: instructorId,
          total_students: 1680,
          duration_hours: 100,
          category_id: null
        }
      ]

      // Insert demo courses directly into database
      const { data, error } = await supabase
        .from('courses')
        .insert(demoCourses)
        .select()

      if (error) {
        throw new Error(`Failed to create demo courses: ${error.message}`)
      }

      console.log('Demo courses created successfully:', data)
      return data
    },
    onSuccess: () => {
      console.log('Demo courses created, refreshing queries...')
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['featured-courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
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
