
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { EnhancedPaymentButton } from '@/components/payment/EnhancedPaymentButton'
import { CouponField } from '@/components/coupons/CouponField'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { 
  Clock, 
  Users, 
  BookOpen, 
  Star, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Award, 
  Globe,
  ArrowLeft,
  Play,
  Check,
  Phone,
  Video
} from 'lucide-react'

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  console.log('CourseDetailPage - courseId from params:', courseId)

  const { data: course, isLoading, error } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      if (!courseId) {
        throw new Error('Course ID is required')
      }
      
      console.log('Fetching course with ID:', courseId)
      
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          course_categories(name, color),
          profiles(id, full_name, bio, avatar_url)
        `)
        .eq('id', courseId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching course:', error)
        throw error
      }

      console.log('Course data fetched:', data)
      return data
    },
    enabled: !!courseId
  })

  // Fetch enrollment count
  const { data: enrollmentCount = 0 } = useQuery({
    queryKey: ['enrollment-count', courseId],
    queryFn: async () => {
      if (!courseId) return 0
      
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
      
      if (error) {
        console.error('Error fetching enrollment count:', error)
        return 0
      }
      
      return count || 0
    },
    enabled: !!courseId
  })

  // Fetch module count
  const { data: moduleCount = 0 } = useQuery({
    queryKey: ['module-count', courseId],
    queryFn: async () => {
      if (!courseId) return 0
      
      const { count, error } = await supabase
        .from('course_modules')
        .select('*', { count: 'exact', head: true })
        .eq('course_id', courseId)
        .eq('is_published', true)
      
      if (error) {
        console.error('Error fetching module count:', error)
        return 0
      }
      
      return count || 0
    },
    enabled: !!courseId
  })

  // Fetch course rating
  const { data: ratingData } = useQuery({
    queryKey: ['course-rating', courseId],
    queryFn: async () => {
      if (!courseId) return { average: 0, count: 0 }
      
      const { data, error } = await supabase
        .from('course_ratings')
        .select('rating')
        .eq('course_id', courseId)
      
      if (error) {
        console.error('Error fetching course ratings:', error)
        return { average: 0, count: 0 }
      }
      
      if (!data || data.length === 0) {
        return { average: 0, count: 0 }
      }
      
      const average = data.reduce((sum, item) => sum + item.rating, 0) / data.length
      return { average: Math.round(average * 10) / 10, count: data.length }
    },
    enabled: !!courseId
  })

  const faqs = [
    {
      id: '1',
      question: 'কোর্সটি কতদিনের জন্য অ্যাক্সেস পাবো?',
      answer: 'আপনি এই কোর্সটি লাইফটাইম অ্যাক্সেস পাবেন। একবার এনরোল করলে আপনি যেকোনো সময় কোর্সটি দেখতে পারবেন।'
    },
    {
      id: '2',
      question: 'কোর্স সার্টিফিকেট পাবো কি?',
      answer: 'হ্যাঁ, কোর্স সম্পূর্ণ করার পর আপনি একটি সার্টিফিকেট পাবেন যা আপনার প্রোফাইলে যুক্ত হবে।'
    },
    {
      id: '3',
      question: 'পেমেন্ট কিভাবে করবো?',
      answer: 'আপনি বিকাশ, নগদ, রকেট বা কার্ডের মাধ্যমে পেমেন্ট করতে পারবেন। পেমেন্ট সম্পূর্ণভাবে সিকিউর।'
    },
    {
      id: '4',
      question: 'কোর্সের ভিডিও ডাউনলোড করা যাবে?',
      answer: 'না, কোর্সের ভিডিও ডাউনলোড করা যাবে না। তবে আপনি অনলাইনে যেকোনো সময় দেখতে পারবেন।'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground">The course you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  const renderVideoOrImage = () => {
    if (course.video_url) {
      let videoId = ''
      const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
      const match = course.video_url.match(youtubeRegex)
      if (match) {
        videoId = match[1]
      }

      if (videoId) {
        return (
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black group cursor-pointer">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-all duration-300">
              <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 text-gray-800 ml-1" />
              </div>
            </div>
          </div>
        )
      }
    }

    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100">
        <img
          src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=450&fit=crop'}
          alt={course.title}
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-5xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Check if we have navigation history, otherwise go to home
              if (window.history.length > 1) {
                navigate(-1)
              } else {
                navigate('/')
              }
            }}
            className="flex items-center gap-2 self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold">
              {course.title}
            </h1>
          </div>
        </div>

        {/* Video/Image Section */}
        <div className="mb-6">
          {renderVideoOrImage()}
        </div>

        {/* Course Description */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                {course.course_categories && (
                  <Badge 
                    className="px-3 py-1 text-sm font-medium"
                    style={{ 
                      backgroundColor: course.course_categories.color + '20', 
                      color: course.course_categories.color 
                    }}
                  >
                    {course.course_categories.name}
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {course.difficulty_level}
                </Badge>
              </div>

              <div>
                <p className="text-muted-foreground leading-relaxed">
                  {descriptionExpanded
                    ? course.description 
                    : `${course.description?.slice(0, 150)}${course.description && course.description.length > 150 ? '...' : ''}`
                  }
                </p>
                {course.description && course.description.length > 150 && (
                  <Button
                    variant="link"
                    className="p-0 h-auto text-primary hover:text-primary/80"
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  >
                    {descriptionExpanded ? 'See Less' : 'See More'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg mx-auto mb-2">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{enrollmentCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Enrolled</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg mx-auto mb-2">
                  <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{course.duration_hours || 0}h</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time Required</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg mx-auto mb-2">
                  <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{moduleCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Videos</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg mx-auto mb-2">
                  <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">Lifetime</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Course Validity</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Instructors Section */}
        {course.profiles && (
          <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Course Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {course.profiles.avatar_url ? (
                    <img
                      src={course.profiles.avatar_url}
                      alt={course.profiles.full_name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {course.profiles.full_name}
                  </h3>
                  {course.profiles.bio && (
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {course.profiles.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Learning Outcomes Section */}
        {course.learning_outcomes && course.learning_outcomes.length > 0 && (
          <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">What you will learn by doing the course</h2>
              <div className="grid gap-4">
                {course.learning_outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{outcome}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Details Section */}
        {course.about_course && (
          <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <Collapsible open={aboutExpanded} onOpenChange={setAboutExpanded}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto text-left">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">About the Course</h2>
                    {aboutExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator className="my-4" />
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    {course.about_course.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )}


        {/* Payment Process Section */}
        <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Payment Process</h2>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mt-0.5">
                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                পেমেন্ট প্রসেস সম্পর্কে বিস্তারিত জানতে{' '}
                <Button variant="link" className="p-0 h-auto text-[#00CFFF] hover:text-[#00B8E6] underline">
                  এই ভিডিওটি দেখুন
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                  <button
                    className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                  >
                    <span className="font-medium text-gray-900 dark:text-white">{faq.question}</span>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-3 text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline" className="border-[#00CFFF] text-[#00CFFF] hover:bg-[#00CFFF] hover:text-white">
                All FAQs
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="mb-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Have any more questions?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              আরো কোন প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন
            </p>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <Phone className="h-4 w-4 mr-2" />
              Call Now: +880 1700-000000
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Payment Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4 z-50">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.price === 0 ? 'Free' : `৳${course.price}`}
              </div>
              {ratingData && ratingData.count > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{ratingData.average}</span>
                  <span>({ratingData.count} reviews)</span>
                </div>
              )}
            </div>
          </div>
          
          <EnhancedPaymentButton 
            course={{
              id: course.id,
              title: course.title,
              price: course.price,
              thumbnail_url: course.thumbnail_url
            }}
            className="px-8 py-3 text-lg font-semibold min-w-[150px]"
          >
            {course.price === 0 ? 'Enroll for Free' : 'Enroll'}
          </EnhancedPaymentButton>
        </div>
      </div>
    </div>
  )
}
