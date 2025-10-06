import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, X } from 'lucide-react'
import { useCourseCategories } from '@/hooks/useCourseCategories'

// Generate a consistent UUID for super admin based on email
const generateSuperAdminId = (email: string): string => {
  // Create a consistent UUID v5 based on email
  // Using a simple hash-based approach for consistency
  const hash = email.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  
  // Convert to positive number and create UUID format
  const positiveHash = Math.abs(hash)
  const uuid = [
    positiveHash.toString(16).padStart(8, '0').slice(0, 8),
    positiveHash.toString(16).padStart(4, '0').slice(0, 4),
    '4000', // Version 4 UUID
    '8000', // Variant bits
    positiveHash.toString(16).padStart(12, '0').slice(0, 12)
  ].join('-')
  
  return uuid
}

interface CourseFormData {
  title: string
  description: string
  price: string
  category_id: string
  difficulty_level: string
  thumbnail_url: string
  is_published: boolean
  duration_hours: string
}

interface CourseFormProps {
  onSuccess: () => void
}

export function CourseForm({ onSuccess }: CourseFormProps) {
  const [uploading, setUploading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('')
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: '0',
    category_id: '',
    difficulty_level: 'beginner',
    thumbnail_url: '',
    is_published: false,
    duration_hours: '0'
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading: categoriesLoading } = useCourseCategories()

  const createCourseMutation = useMutation({
    mutationFn: async (courseFormData: CourseFormData) => {
      console.log('=== COURSE CREATION START ===')
      console.log('Form Data:', courseFormData)
      
      const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
      const superAdminEmail = localStorage.getItem('superAdminEmail')
      
      if (!isSuperAdmin || !superAdminEmail) {
        throw new Error('Super admin authentication required')
      }

      let thumbnailUrl = courseFormData.thumbnail_url

      if (thumbnailFile) {
        console.log('Uploading thumbnail image...')
        setUploading(true)
        try {
          const fileExt = thumbnailFile.name.split('.').pop()
          const fileName = `course-thumbnail-${Date.now()}.${fileExt}`
          
      // First check if bucket exists and create if it doesn't
      const { error: bucketError } = await supabase.storage.getBucket('course-images')
      
      if (bucketError && bucketError.message?.includes('does not exist')) {
        console.log('Creating course-images bucket...')
        const { error: createBucketError } = await supabase.storage.createBucket('course-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        })
        
        if (createBucketError) {
          console.error('Failed to create bucket:', createBucketError)
        }
      }

      const { data, error } = await supabase.storage
        .from('course-images')
        .upload(fileName, thumbnailFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Storage upload error:', error)
        throw new Error(`Failed to upload image: ${error.message}`)
      }

          const { data: { publicUrl } } = supabase.storage
            .from('course-images')
            .getPublicUrl(fileName)

          thumbnailUrl = publicUrl
          console.log('Thumbnail uploaded:', thumbnailUrl)
        } catch (error) {
          console.error('Image upload failed:', error)
          setUploading(false)
          throw error
        }
        setUploading(false)
      }

      // Generate consistent UUID for super admin
      const instructorId = generateSuperAdminId(superAdminEmail)
      console.log('Generated instructor ID:', instructorId)

      const coursePayload = {
        title: courseFormData.title.trim(),
        description: courseFormData.description?.trim() || '',
        price: Math.max(0, parseFloat(courseFormData.price) || 0),
        category_id: courseFormData.category_id || null,
        difficulty_level: courseFormData.difficulty_level || 'beginner',
        thumbnail_url: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
        is_published: Boolean(courseFormData.is_published),
        instructor_id: instructorId,
        total_students: 0,
        total_modules: 0,
        duration_hours: Math.max(0, parseInt(courseFormData.duration_hours) || 0)
      }

      console.log('Final course payload:', coursePayload)

      // First, ensure super admin profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', instructorId)
        .maybeSingle()

      if (profileError) {
        console.error('Profile check error:', profileError)
      }

      if (!existingProfile) {
        console.log('Creating super admin profile...')
        const { error: createProfileError } = await supabase
          .from('profiles')
          .insert({
            id: instructorId,
            email: superAdminEmail,
            full_name: superAdminEmail === 'abdullahusimin1@gmail.com' ? 'Abdullah Usimin' : 
                      superAdminEmail === 'stv7168@gmail.com' ? 'STV Admin' : 
                      superAdminEmail === 'abdullahabeer003@gmail.com' ? 'Abdullah Abeer' : 'Super Admin',
            role: 'super_admin',
            approval_status: 'approved',
            email_verified: true
          })

        if (createProfileError) {
          console.error('Profile creation error:', createProfileError)
          // Continue anyway, the course creation might still work
        }
      }
      
      // Use direct database insertion for super admin
      const { data: insertedCourse, error } = await supabase
        .from('courses')
        .insert(coursePayload)
        .select()

      if (error) {
        console.error('Course creation error:', error)
        throw new Error(`Failed to create course: ${error.message}`)
      }

      console.log('Course created successfully:', insertedCourse)
      return insertedCourse
    },
    onSuccess: (data) => {
      console.log('=== COURSE CREATION SUCCESS ===')
      console.log('Created course:', data)
      
      // Force refresh all course-related queries
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['featured-courses'] })
      queryClient.invalidateQueries({ queryKey: ['course-categories'] })
      
      toast({ 
        title: 'Course Created Successfully!',
        description: `Course "${data?.[0]?.title || formData.title}" has been ${data?.[0]?.is_published ? 'published' : 'saved as draft'}.`
      })
      
      onSuccess()
      resetForm()
    },
    onError: (error: any) => {
      console.error('=== COURSE CREATION FAILED ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      setUploading(false)
      
      let errorMessage = 'An unexpected error occurred while creating the course.'
      
      if (error.message) {
        if (error.message.includes('Failed to create course:')) {
          errorMessage = error.message
        } else if (error.message.includes('Super admin authentication required')) {
          errorMessage = 'Please ensure you are logged in as a super admin.'
        } else if (error.message.includes('Course title is required')) {
          errorMessage = 'Course title is required and cannot be empty.'
        } else if (error.message.includes('invalid input syntax for type uuid')) {
          errorMessage = 'Invalid instructor ID format. Please try logging in again.'
        } else {
          errorMessage = `Error: ${error.message}`
        }
      }
      
      toast({
        title: 'Failed to create course',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  })

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '0',
      category_id: '',
      difficulty_level: 'beginner',
      thumbnail_url: '',
      is_published: false,
      duration_hours: '0'
    })
    setThumbnailFile(null)
    setThumbnailPreview('')
    setUploading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== FORM SUBMISSION START ===')
    console.log('Form data:', formData)
    
    if (!formData.title?.trim()) {
      toast({ 
        title: 'Course title is required', 
        description: 'Please enter a course title',
        variant: 'destructive' 
      })
      return
    }

    const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
    const superAdminEmail = localStorage.getItem('superAdminEmail')
    
    if (!isSuperAdmin || !superAdminEmail) {
      toast({ 
        title: 'Authentication required', 
        description: 'Please ensure you are logged in as super admin',
        variant: 'destructive' 
      })
      return
    }
    
    console.log('Validation passed, starting course creation...')
    createCourseMutation.mutate(formData)
  }

  const handleInputChange = (field: keyof CourseFormData, value: string | boolean) => {
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

  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
  const superAdminEmail = localStorage.getItem('superAdminEmail')
  const isFormValid = formData.title.trim().length > 0 && isSuperAdmin && superAdminEmail && !createCourseMutation.isPending && !uploading

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter course description"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty Level</Label>
        <Select
          value={formData.difficulty_level}
          onValueChange={(value) => handleInputChange('difficulty_level', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category_id}
          onValueChange={(value) => handleInputChange('category_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={categoriesLoading ? "Loading categories..." : "Select category"} />
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
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="publish"
          checked={formData.is_published}
          onCheckedChange={(checked) => handleInputChange('is_published', checked)}
        />
        <Label htmlFor="publish">Publish immediately</Label>
      </div>

      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-4">
        <Button 
          type="submit" 
          disabled={!isFormValid}
          className="w-full sm:w-auto min-w-[120px]"
        >
          {uploading ? (
            'Uploading Image...'
          ) : createCourseMutation.isPending ? (
            'Creating Course...'
          ) : (
            'Create Course'
          )}
        </Button>
      </div>
    </form>
  )
}
