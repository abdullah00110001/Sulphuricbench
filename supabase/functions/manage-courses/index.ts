import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== MANAGE COURSES FUNCTION START ===')
  console.log('Request method:', req.method)
  console.log('Request URL:', req.url)

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Use service role client for all operations to bypass RLS
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    let requestBody
    try {
      const bodyText = await req.text()
      console.log('Raw request body:', bodyText)
      
      if (!bodyText || bodyText.trim() === '') {
        console.log('Request body is empty')
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Request body is required' 
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      requestBody = JSON.parse(bodyText)
      console.log('Parsed request body:', requestBody)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid JSON in request body'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { action, superAdminEmail, courseId, data } = requestBody

    console.log('Manage courses request:', { 
      action, 
      superAdminEmail,
      courseId: courseId || 'not provided',
      hasData: !!data
    })

    // Validate required fields
    if (!action) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Action is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate super admin authentication - simplified without token
    const validSuperAdminEmails = ['abdullahusimin1@gmail.com', 'stv7168@gmail.com', 'abdullahabeer003@gmail.com']
    
    if (!superAdminEmail || !validSuperAdminEmails.includes(superAdminEmail)) {
      console.log('Invalid super admin email:', superAdminEmail)
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Unauthorized: Invalid super admin email' 
      }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Authentication successful for super admin:', superAdminEmail)

    // Helper function to generate consistent instructor ID from super admin email
    const generateSuperAdminId = (email: string) => {
      const hash = email.split('').reduce((acc: number, char: string) => {
        return char.charCodeAt(0) + ((acc << 5) - acc)
      }, 0)
      
      const positiveHash = Math.abs(hash)
      const uuid = [
        positiveHash.toString(16).padStart(8, '0').slice(0, 8),
        positiveHash.toString(16).padStart(4, '0').slice(0, 4),
        '4000',
        '8000',
        positiveHash.toString(16).padStart(12, '0').slice(0, 12)
      ].join('-')
      
      return uuid
    }

    let result;

    switch (action) {
      case 'create':
        console.log('Creating course with data:', data)
        
        // Enhanced input validation
        if (!data?.title || !data.title.trim()) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Course title is required and cannot be empty' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // For super admin created courses, we'll set instructor_id to null
        // This avoids foreign key constraint issues
        console.log('Creating course without instructor_id for super admin:', superAdminEmail)
        
        // Prepare course data with comprehensive defaults
        const courseData = {
          title: data.title.trim(),
          description: data.description?.trim() || '',
          about_course: data.about_course?.trim() || '',
          price: Math.max(0, parseFloat(data.price) || 0),
          category_id: data.category_id || null,
          difficulty_level: data.difficulty_level || 'beginner',
          thumbnail_url: data.thumbnail_url?.trim() || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
          is_published: Boolean(data.is_published),
          is_featured: Boolean(data.is_featured),
          instructor_id: null, // Set to null for super admin created courses
          total_students: 0,
          total_modules: 0,
          duration_hours: Math.max(0, parseInt(data.duration_hours) || 0),
          video_url: data.video_url?.trim() || null,
          preview_video_url: data.preview_video_url?.trim() || null,
          learning_outcomes: data.learning_outcomes || [],
          course_validity: data.course_validity || 'lifetime',
          secret_group_link: data.secret_group_link?.trim() || null,
          available_batches: data.available_batches || [],
          instructors: data.instructors || []
        }
        
        console.log('Final course data to insert:', courseData)
        
        // Create course using service role client
        const { data: createData, error: createError } = await supabaseClient
          .from('courses')
          .insert(courseData)
          .select(`
            *,
            profiles:instructor_id(full_name, avatar_url),
            course_categories(name, color)
          `)
        
        console.log('Course creation result:', { data: createData, error: createError })
        
        if (createError) {
          console.error('Course creation error:', createError)
          
          let errorMessage = 'Failed to create course'
          if (createError.code === '23503') {
            errorMessage = 'Invalid instructor or category reference'
          } else if (createError.code === '23505') {
            errorMessage = 'Course with this title already exists'
          } else {
            errorMessage = `Failed to create course: ${createError.message}`
          }
          
          return new Response(JSON.stringify({ 
            success: false,
            error: errorMessage,
            details: createError
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        result = { data: createData, error: null }
        break

      case 'update':
        if (!courseId) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Course ID is required for update' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        const updateData = {
          ...data,
          updated_at: new Date().toISOString()
        }

        const { data: updateResult, error: updateError } = await supabaseClient
          .from('courses')
          .update(updateData)
          .eq('id', courseId)
          .select(`
            *,
            profiles:instructor_id(full_name, avatar_url),
            course_categories(name, color)
          `)

        result = { data: updateResult, error: updateError }
        break

      case 'delete':
        if (!courseId) {
          return new Response(JSON.stringify({ 
            success: false,
            error: 'Course ID is required for delete' 
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        console.log('Deleting course with cascade:', courseId)
        
        // Use the cascade delete function
        const { data: cascadeResult, error: cascadeError } = await supabaseClient
          .rpc('delete_course_cascade', { course_id_param: courseId })

        if (cascadeError) {
          console.error('Cascade delete error:', cascadeError)
          return new Response(JSON.stringify({ 
            success: false,
            error: cascadeError.message,
            details: cascadeError
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (!cascadeResult?.success) {
          console.error('Cascade delete failed:', cascadeResult)
          return new Response(JSON.stringify({ 
            success: false,
            error: cascadeResult?.error || 'Failed to delete course',
            details: cascadeResult
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        result = { data: cascadeResult, error: null }
        break

      case 'get_my_courses':
        // Generate instructor ID from super admin email for consistency
        const myInstructorId = generateSuperAdminId(superAdminEmail)
        
        const { data: myCourses, error: myCoursesError } = await supabaseClient
          .from('courses')
          .select(`
            *,
            profiles:instructor_id(full_name, avatar_url),
            enrollments(id, student_id),
            course_modules(*),
            course_categories(name, color)
          `)
          .eq('instructor_id', myInstructorId)
          .order('created_at', { ascending: false })

        result = { data: myCourses, error: myCoursesError }
        break

      case 'get_all_courses':
        const { data: allCourses, error: allCoursesError } = await supabaseClient
          .from('courses')
          .select(`
            *,
            profiles:instructor_id(full_name, avatar_url),
            enrollments(id, student_id),
            course_modules(*),
            course_categories(name, color),
            course_ratings(rating, review)
          `)
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        result = { data: allCourses, error: allCoursesError }
        break

      case 'get_featured_courses':
        const { data: featuredCourses, error: featuredError } = await supabaseClient
          .from('courses')
          .select(`
            *,
            profiles:instructor_id(full_name, avatar_url),
            enrollments(id, student_id),
            course_modules(*),
            course_categories(name, color),
            course_ratings(rating, review)
          `)
          .eq('is_published', true)
          .order('total_students', { ascending: false })
          .limit(6)

        result = { data: featuredCourses, error: featuredError }
        break

      case 'get_admin_courses':
        const { data: adminCourses, error: adminCoursesError } = await supabaseClient
          .from('courses')
          .select(`
            *,
            profiles:instructor_id(full_name, avatar_url),
            enrollments(id, student_id),
            course_modules(*),
            course_categories(name, color),
            course_ratings(rating, review)
          `)
          .order('created_at', { ascending: false })

        result = { data: adminCourses, error: adminCoursesError }
        break

      case 'create_sample_courses':
        console.log('Creating sample courses...')
        
        // Generate instructor ID from super admin email for consistency
        const sampleInstructorId = generateSuperAdminId(superAdminEmail)
        
        const sampleCourses = [
          {
            title: 'ACS Varsity + GST Special Private Programme 2025',
            description: 'বর্তমানে অনেক শিক্ষার্থীর মনে একটি ধারণা গড়ে উঠেছে ভার্সিটিতে চান্স পেতে হলে ইঞ্জিনিয়ারিং বা মেডিকেল টার্গেটেড ক্লাসে পড়তে হয়। কারণ সেখানে গণিতভীরু পড়ানো হয়। কিন্তু বাস্তবে দেখা যায় — সব শিক্ষার্থী সেখানে সঠিকভাবে বোঝে না, টিচারদের সবার প্রতি সমান মনোযোগও বজায় থাকে না।',
            price: 5000,
            difficulty_level: 'intermediate',
            thumbnail_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop',
            is_published: true,
            instructor_id: sampleInstructorId,
            total_students: 226,
            duration_hours: 140,
            category_id: null
          },
          {
            title: 'Complete Web Development Bootcamp 2025',
            description: 'Master modern web development with HTML5, CSS3, JavaScript ES6+, React.js, Node.js, Express.js, MongoDB and much more. Build real-world projects and deploy them to production. Perfect for beginners and intermediate developers.',
            price: 3500,
            difficulty_level: 'beginner',
            thumbnail_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
            is_published: true,
            instructor_id: sampleInstructorId,
            total_students: 189,
            duration_hours: 60,
            category_id: null
          },
          {
            title: 'Advanced Machine Learning with Python',
            description: 'Deep dive into machine learning algorithms, neural networks, and AI applications. Learn scikit-learn, TensorFlow, and PyTorch with hands-on projects.',
            price: 7500,
            difficulty_level: 'advanced',
            thumbnail_url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
            is_published: true,
            instructor_id: sampleInstructorId,
            total_students: 156,
            duration_hours: 80,
            category_id: null
          }
        ]

        const { data: sampleData, error: sampleError } = await supabaseClient
          .from('courses')
          .insert(sampleCourses)
          .select(`
            *,
            profiles:instructor_id(full_name, avatar_url),
            course_categories(name, color)
          `)

        result = { data: sampleData, error: sampleError }
        break

      default:
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid action: ' + action
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    if (result.error) {
      console.error('Database operation error:', result.error)
      return new Response(JSON.stringify({ 
        success: false,
        error: result.error.message,
        details: result.error
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Operation completed successfully')
    console.log('Returning success response with data count:', result.data?.length || 'single item')

    return new Response(JSON.stringify({
      success: true,
      message: `${action} completed successfully`,
      data: result.data
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
      details: error instanceof Error ? error.stack : 'No stack trace'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})