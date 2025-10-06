import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Plus, Upload, X, Loader2 } from 'lucide-react'

// Super admin emails - simplified authentication
const SUPER_ADMIN_EMAILS = [
  'abdullahusimin1@gmail.com',
  'stv7168@gmail.com',
  'abdullahabeer003@gmail.com'
]

// Check if current user is super admin
const isSuperAdmin = () => {
  const superAdminEmail = localStorage.getItem('superAdminEmail')
  return superAdminEmail && SUPER_ADMIN_EMAILS.includes(superAdminEmail)
}

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

export function CourseCreator() {
  const [open, setOpen] = useState(false)
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

  console.log('CourseCreator - Auth state:', { 
    isSuperAdmin: isSuperAdmin(),
    superAdminEmail: localStorage.getItem('superAdminEmail')
  })

  // Fetch course categories
  const { data: categories = [] } = useQuery({
    queryKey: ['course-categories'],
    queryFn: async () => {
      console.log('Fetching categories...')
      const { data, error } = await supabase
        .from('course_categories')
        .select('*')
        .order('name')

      if (error) {
        console.error('Categories fetch error:', error)
        throw error
      }
      console.log('Categories fetched:', data)
      return data || []
    }
  })

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `course-thumbnail-${Date.now()}.${fileExt}`
    
    console.log('Uploading image to course-images bucket:', fileName)
    
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
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('course-images')
      .getPublicUrl(fileName)

    console.log('Image uploaded successfully:', publicUrl)
    return publicUrl
  }

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: CourseFormData) => {
      console.log('Creating course with data:', courseData)
      
      if (!isSuperAdmin()) {
        throw new Error('Super admin authentication required')
      }

      let thumbnailUrl = courseData.thumbnail_url

      // Upload thumbnail if file is selected
      if (thumbnailFile) {
        console.log('Uploading thumbnail image...')
        setUploading(true)
        try {
          thumbnailUrl = await uploadImage(thumbnailFile)
          console.log('Thumbnail uploaded:', thumbnailUrl)
        } catch (error) {
          console.error('Image upload failed:', error)
          setUploading(false)
          throw error
        }
        setUploading(false)
      }

      const superAdminEmail = localStorage.getItem('superAdminEmail')
      if (!superAdminEmail) {
        throw new Error('Super admin email not found')
      }

      // Generate consistent UUID for super admin
      const instructorId = generateSuperAdminId(superAdminEmail)
      console.log('Generated instructor ID:', instructorId)

      // Enhanced course payload with validation
      const coursePayload = {
        title: courseData.title.trim(),
        description: courseData.description?.trim() || '',
        price: Math.max(0, parseFloat(courseData.price) || 0),
        category_id: courseData.category_id || null,
        difficulty_level: courseData.difficulty_level || 'beginner',
        thumbnail_url: thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
        is_published: Boolean(courseData.is_published),
        duration_hours: Math.max(0, parseInt(courseData.duration_hours) || 0),
        instructor_id: instructorId,
        total_students: 0,
        total_modules: 0
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

      const { data, error } = await supabase
        .from('courses')
        .insert(coursePayload)
        .select(`
          *,
          profiles:instructor_id(full_name, avatar_url),
          course_categories(name, color)
        `)

      if (error) {
        console.error('Course creation error:', error)
        throw new Error('Failed to create course: ' + error.message)
      }

      console.log('Course created successfully:', data)
      return data
    },
    onSuccess: (data) => {
      console.log('=== COURSE CREATION SUCCESS ===')
      console.log('Created course:', data)
      
      // Comprehensive query invalidation
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['featured-courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      
      toast({ 
        title: 'Success!',
        description: `Course "${data?.[0]?.title || 'Unknown'}" has been ${data?.[0]?.is_published ? 'published' : 'saved as draft'} successfully.`
      })
      
      setOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      console.error('=== COURSE CREATION FAILED ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      setUploading(false)
      
      // Enhanced error message handling
      let errorMessage = 'An unexpected error occurred while creating the course.'
      
      if (error.message) {
        if (error.message.includes('Course title is required')) {
          errorMessage = 'Course title is required and cannot be empty.'
        } else if (error.message.includes('Super admin authentication required')) {
          errorMessage = 'Please ensure you are logged in as a super admin.'
        } else if (error.message.includes('already exists')) {
          errorMessage = 'A course with this title already exists. Please choose a different title.'
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error occurred. Please check your connection and try again.'
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
    console.log('Super admin check:', {
      isSuperAdmin: isSuperAdmin(),
      superAdminEmail: localStorage.getItem('superAdminEmail')
    })
    
    // Enhanced validation
    if (!formData.title?.trim()) {
      toast({ 
        title: 'Course title is required', 
        description: 'Please enter a course title',
        variant: 'destructive' 
      })
      return
    }

    if (formData.title.trim().length < 3) {
      toast({ 
        title: 'Course title too short', 
        description: 'Course title must be at least 3 characters long',
        variant: 'destructive' 
      })
      return
    }

    if (!isSuperAdmin()) {
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

    // Enhanced file validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPG, PNG, GIF, WebP)',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (max 5MB)
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

  // Enhanced form validation
  const isFormValid = formData.title.trim().length >= 3 && isSuperAdmin() && !createCourseMutation.isPending && !uploading

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Create a new course for students to enroll in. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter course title (minimum 3 characters)"
              required
              minLength={3}
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

          <div className="grid grid-cols-2 gap-4">
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
                <SelectValue placeholder="Select category (optional)" />
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
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WebP up to 5MB</p>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
              disabled={createCourseMutation.isPending || uploading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!isFormValid}
              className="min-w-[120px]"
            >
              {uploading ? (
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
