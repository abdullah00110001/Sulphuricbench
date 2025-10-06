import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Loader2, Upload, BookOpen, Sparkles, Zap, Star, Plus, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

export function HeroStyleCourseCreator() {
  const { toast } = useToast()
  const { uploadImage, isUploading } = useImageUpload()
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about_course: '',
    price: '',
    duration_hours: '',
    difficulty_level: 'beginner',
    category_id: '',
    learning_outcomes: [''],
    thumbnail_file: null as File | null,
    secret_group_link: '',
    instructors: [''],
    batches: ['']
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data || []
    }
  })

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('is_active', true)
        .order('full_name')
      
      if (error) throw error
      return data || []
    }
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleArrayChange = (field: 'learning_outcomes' | 'instructors' | 'batches', index: number, value: string) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData(prev => ({ ...prev, [field]: newArray }))
  }

  const addArrayItem = (field: 'learning_outcomes' | 'instructors' | 'batches') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }))
  }

  const removeArrayItem = (field: 'learning_outcomes' | 'instructors' | 'batches', index: number) => {
    if (formData[field].length > 1) {
      const newArray = formData[field].filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, [field]: newArray }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail_file: file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      let thumbnail_url = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop'
      
      if (formData.thumbnail_file) {
        const uploadedUrl = await uploadImage(formData.thumbnail_file)
        if (uploadedUrl) {
          thumbnail_url = uploadedUrl
        }
      }

      const courseData = {
        title: formData.title,
        description: formData.description,
        about_course: formData.about_course,
        price: parseFloat(formData.price) || 0,
        duration_hours: parseInt(formData.duration_hours) || 0,
        difficulty_level: formData.difficulty_level,
        category_id: formData.category_id || null,
        learning_outcomes: formData.learning_outcomes.filter(outcome => outcome.trim()),
        thumbnail_url,
        is_published: true,
        secret_group_link: formData.secret_group_link || null,
        instructors: formData.instructors.filter(instructor => instructor.trim()),
        available_batches: formData.batches.filter(batch => batch.trim())
      }

      const { data, error } = await supabase
        .from('courses')
        .insert([courseData])
        .select()
        .single()

      if (error) throw error

      toast({
        title: "✨ Course Created Successfully!",
        description: `${formData.title} has been created and is now live!`,
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        about_course: '',
        price: '',
        duration_hours: '',
        difficulty_level: 'beginner',
        category_id: '',
        learning_outcomes: [''],
        thumbnail_file: null,
        secret_group_link: '',
        instructors: [''],
        batches: ['']
      })

    } catch (error: any) {
      console.error('Error creating course:', error)
      toast({
        title: "Error Creating Course",
        description: error.message || "Failed to create course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Course Creator
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Create Amazing Courses
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Build engaging learning experiences that inspire and educate students worldwide
          </p>
        </div>

        {/* Course Creation Form */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                New Course
              </CardTitle>
            </div>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Fill in the details below to create your course
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course Title
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter course title"
                    className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Price (BDT)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="0 for free course"
                    className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your course"
                  className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="about_course" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  About This Course
                </Label>
                <Textarea
                  id="about_course"
                  value={formData.about_course}
                  onChange={(e) => handleInputChange('about_course', e.target.value)}
                  placeholder="Detailed information about your course"
                  className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Duration (hours)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                    placeholder="Duration"
                    className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Difficulty Level
                  </Label>
                  <select
                    id="difficulty"
                    value={formData.difficulty_level}
                    onChange={(e) => handleInputChange('difficulty_level', e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </Label>
                  <select
                    id="category"
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className="w-full px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret_group_link" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Secret Group Link (Optional)
                </Label>
                <Input
                  id="secret_group_link"
                  value={formData.secret_group_link}
                  onChange={(e) => handleInputChange('secret_group_link', e.target.value)}
                  placeholder="https://t.me/your-secret-group"
                  className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course Thumbnail
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </label>
                  {formData.thumbnail_file && (
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      {formData.thumbnail_file.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course Instructors
                </Label>
                {formData.instructors.map((instructor, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <select
                      value={instructor}
                      onChange={(e) => handleArrayChange('instructors', index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-md"
                    >
                      <option value="">Select Instructor</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.full_name}>
                          {teacher.full_name}
                        </option>
                      ))}
                    </select>
                    {formData.instructors.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('instructors', index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('instructors')}
                  className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Instructor
                </Button>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Available Batches
                </Label>
                {formData.batches.map((batch, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={batch}
                      onChange={(e) => handleArrayChange('batches', index, e.target.value)}
                      placeholder="e.g., HSC 25, HSC 26"
                      className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                    />
                    {formData.batches.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('batches', index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('batches')}
                  className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Batch
                </Button>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Learning Outcomes
                </Label>
                {formData.learning_outcomes.map((outcome, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                    <Input
                      value={outcome}
                      onChange={(e) => handleArrayChange('learning_outcomes', index, e.target.value)}
                      placeholder="What will students learn?"
                      className="bg-white/50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                    />
                    {formData.learning_outcomes.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeArrayItem('learning_outcomes', index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addArrayItem('learning_outcomes')}
                  className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Learning Outcome
                </Button>
              </div>

              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={isCreating || isUploading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <Zap className="h-5 w-5 mr-2" />
                      Create Course
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
