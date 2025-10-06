
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Upload, X, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useCourseCategories } from '@/hooks/useCourseCategories'
import { useImageUpload } from '@/hooks/useImageUpload'

export function EnhancedCourseCreator() {
  const [isOpen, setIsOpen] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    about_course: '',
    price: '',
    category_id: '',
    difficulty_level: 'beginner',
    thumbnail_url: '',
    is_published: false,
    is_featured: false,
    duration_hours: '',
    video_url: '',
    preview_video_url: '',
    course_validity: 'lifetime',
    secret_group_link: '',
    learning_outcomes: [] as string[],
    available_batches: [] as string[],
    instructors: [] as string[]
  })

  // State for dynamic fields
  const [newLearningOutcome, setNewLearningOutcome] = useState('')
  const [newBatch, setNewBatch] = useState('')

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading: categoriesLoading } = useCourseCategories()
  const { uploadImage, isUploading } = useImageUpload()

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: typeof formData) => {
      console.log('Creating course with data:', courseData)
      
      let finalThumbnailUrl = courseData.thumbnail_url

      // Upload image if file is selected
      if (thumbnailFile) {
        console.log('Uploading thumbnail image...')
        const uploadedUrl = await uploadImage(thumbnailFile, 'course-images')
        
        if (!uploadedUrl) {
          throw new Error('Failed to upload thumbnail image')
        }
        
        finalThumbnailUrl = uploadedUrl
        console.log('Thumbnail uploaded successfully:', finalThumbnailUrl)
      }

      // Use the edge function to create the course
      const { data, error } = await supabase.functions.invoke('manage-courses', {
        body: {
          action: 'create',
          superAdminEmail: 'abdullahusimin1@gmail.com', // This should come from auth context
          data: {
            ...courseData,
            thumbnail_url: finalThumbnailUrl,
            price: parseFloat(courseData.price) || 0,
            duration_hours: parseInt(courseData.duration_hours) || 0
          }
        }
      })

      if (error) {
        console.error('Edge function error:', error)
        throw new Error(`Failed to create course: ${error.message}`)
      }

      if (!data?.success) {
        console.error('Course creation failed:', data)
        throw new Error(data?.error || 'Failed to create course')
      }

      console.log('Course created successfully:', data)
      return data.data
    },
    onSuccess: (data) => {
      console.log('Course creation success:', data)
      
      toast({ 
        title: 'Course Created Successfully!',
        description: `Course "${formData.title}" has been created.`
      })
      
      // Reset form and close dialog
      resetForm()
      setIsOpen(false)
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['featured-courses'] })
    },
    onError: (error: any) => {
      console.error('Course creation failed:', error)
      
      toast({
        title: 'Failed to create course',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive'
      })
    }
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      about_course: '',
      price: '',
      category_id: '',
      difficulty_level: 'beginner',
      thumbnail_url: '',
      is_published: false,
      is_featured: false,
      duration_hours: '',
      video_url: '',
      preview_video_url: '',
      course_validity: 'lifetime',
      secret_group_link: '',
      learning_outcomes: [],
      available_batches: [],
      instructors: []
    })
    setThumbnailFile(null)
    setThumbnailPreview('')
    setNewLearningOutcome('')
    setNewBatch('')
  }

  // Functions for dynamic fields
  const addLearningOutcome = () => {
    if (newLearningOutcome.trim()) {
      handleInputChange('learning_outcomes', [...formData.learning_outcomes, newLearningOutcome.trim()])
      setNewLearningOutcome('')
    }
  }

  const removeLearningOutcome = (index: number) => {
    const updated = formData.learning_outcomes.filter((_, i) => i !== index)
    handleInputChange('learning_outcomes', updated)
  }

  const addBatch = () => {
    if (newBatch.trim()) {
      handleInputChange('available_batches', [...formData.available_batches, newBatch.trim()])
      setNewBatch('')
    }
  }

  const removeBatch = (index: number) => {
    const updated = formData.available_batches.filter((_, i) => i !== index)
    handleInputChange('available_batches', updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission:', formData)
    
    if (!formData.title.trim()) {
      toast({ 
        title: 'Course title is required', 
        description: 'Please enter a course title',
        variant: 'destructive' 
      })
      return
    }

    console.log('Validation passed, creating course...')
    createCourseMutation.mutate(formData)
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean | string[]) => {
    console.log(`Updating ${field}:`, value)
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('Selected file:', file.name, file.type, file.size)

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB',
        variant: 'destructive'
      })
      return
    }

    setThumbnailFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = () => {
      setThumbnailPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview('')
    setFormData(prev => ({ ...prev, thumbnail_url: '' }))
  }

  const isFormValid = formData.title.trim().length > 0 && !createCourseMutation.isPending && !isUploading

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new course
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter course title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Brief description of the course"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="about_course">About Course</Label>
              <Textarea
                id="about_course"
                value={formData.about_course}
                onChange={(e) => handleInputChange('about_course', e.target.value)}
                placeholder="Detailed description of what students will learn"
                rows={4}
              />
            </div>
          </div>

          {/* Course Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (৳)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (Hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="0"
                  value={formData.duration_hours}
                  onChange={(e) => handleInputChange('duration_hours', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category (Optional)</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => handleInputChange('category_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value) => handleInputChange('difficulty_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Beginner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="course_validity">Course Validity</Label>
                <Select
                  value={formData.course_validity}
                  onValueChange={(value) => handleInputChange('course_validity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Lifetime Access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lifetime">Lifetime Access</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="6months">6 Months</SelectItem>
                    <SelectItem value="3months">3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Media</h3>
            
            <div className="space-y-2">
              <Label>Course Thumbnail</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                {thumbnailPreview ? (
                  <div className="relative">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail preview" 
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeThumbnail}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <Label htmlFor="thumbnail-upload" className="cursor-pointer">
                        <span className="text-sm text-gray-600">
                          Click to upload or drag and drop
                        </span>
                        <Input
                          id="thumbnail-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageSelect}
                          disabled={isUploading}
                        />
                      </Label>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Or enter image URL manually:
              </div>
              <Input
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                disabled={isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="video_url">YouTube Video Link (Optional)</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => handleInputChange('video_url', e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="secret_group_link">Secret Group Link (Optional)</Label>
              <Input
                id="secret_group_link"
                value={formData.secret_group_link}
                onChange={(e) => handleInputChange('secret_group_link', e.target.value)}
                placeholder="Telegram/WhatsApp group link"
              />
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Learning Outcomes *</Label>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newLearningOutcome}
                  onChange={(e) => setNewLearningOutcome(e.target.value)}
                  placeholder="What will students learn?"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addLearningOutcome()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addLearningOutcome}
                  disabled={!newLearningOutcome.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Learning Outcome
                </Button>
              </div>
              
              {formData.learning_outcomes.length > 0 && (
                <div className="space-y-2">
                  {formData.learning_outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1">{outcome}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLearningOutcome(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Available Batches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Available Batches (Optional)</Label>
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newBatch}
                  onChange={(e) => setNewBatch(e.target.value)}
                  placeholder="e.g., HSC 25, HSC 26"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addBatch()
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={addBatch}
                  disabled={!newBatch.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Batch
                </Button>
              </div>
              
              {formData.available_batches.length > 0 && (
                <div className="space-y-2">
                  {formData.available_batches.map((batch, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1">{batch}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBatch(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Course Instructors */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Course Instructors (Optional)</Label>
            </div>
            
            <div className="space-y-2">
              <Select
                onValueChange={(value) => {
                  if (value && !formData.instructors.includes(value)) {
                    handleInputChange('instructors', [...formData.instructors, value])
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instructor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instructor1">Select instructor</SelectItem>
                </SelectContent>
              </Select>
              
              {formData.instructors.length > 0 && (
                <div className="space-y-2">
                  {formData.instructors.map((instructor, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="flex-1">{instructor}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const updated = formData.instructors.filter((_, i) => i !== index)
                          handleInputChange('instructors', updated)
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="publish_immediately" className="font-medium">Publish Immediately</Label>
                  <p className="text-sm text-gray-600">Make course visible to students</p>
                </div>
                <Switch
                  id="publish_immediately"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange('is_published', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="mark_featured" className="font-medium">Mark as Featured</Label>
                  <p className="text-sm text-gray-600">Show in featured courses section</p>
                </div>
                <Switch
                  id="mark_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                resetForm()
                setIsOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid}
              className="min-w-[120px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : createCourseMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
