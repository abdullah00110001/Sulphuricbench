
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
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useCourseCategories } from '@/hooks/useCourseCategories'
import { Plus, X, Loader2 } from 'lucide-react'

interface CourseFormData {
  title: string
  description: string
  price: string
  difficulty_level: string
  thumbnail_url: string
  is_published: boolean
  duration_hours: string
  secret_group_link: string
  available_batches: string[]
  category_id: string
}

export function SimpleCourseCreator() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: '0',
    difficulty_level: 'beginner',
    thumbnail_url: '',
    is_published: true,
    duration_hours: '0',
    secret_group_link: '',
    available_batches: [''],
    category_id: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useAuth()
  const { uploadImage, isUploading } = useImageUpload()
  const { data: categories = [] } = useCourseCategories()

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: CourseFormData) => {
      console.log('=== SIMPLE COURSE CREATOR DEBUG START ===')
      console.log('Creating super simple course:', courseData)
      
      try {
        // Get super admin email from localStorage
        const superAdminEmail = localStorage.getItem('superAdminEmail')
        console.log('Super admin email from localStorage:', superAdminEmail)
        
        if (!superAdminEmail) {
          console.error('Super admin email not found in localStorage')
          throw new Error('Super admin email not found. Please log in again.')
        }

        let finalThumbnailUrl = courseData.thumbnail_url

        // Upload image if file is selected
        if (imageFile) {
          try {
            const uploadedUrl = await uploadImage(imageFile, 'course-images')
            if (uploadedUrl) {
              finalThumbnailUrl = uploadedUrl
            }
          } catch (error) {
            console.error('Image upload failed:', error)
            // Continue without image if upload fails
          }
        }

        // Prepare request body
        const requestBody = {
          action: 'create',
          superAdminEmail: superAdminEmail,
          data: {
            title: courseData.title || 'Untitled Course',
            description: courseData.description || 'No description',
            price: parseFloat(courseData.price) || 0,
            difficulty_level: courseData.difficulty_level || 'beginner',
            thumbnail_url: finalThumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=250&fit=crop',
            is_published: Boolean(courseData.is_published),
            duration_hours: parseInt(courseData.duration_hours) || 0,
            secret_group_link: courseData.secret_group_link || null,
            available_batches: courseData.available_batches.filter(batch => batch.trim()),
            category_id: courseData.category_id || null
          }
        }

        console.log('Request body prepared:', JSON.stringify(requestBody, null, 2))

        // Use the manage-courses edge function instead of direct DB access
        console.log('Invoking manage-courses edge function...')
        const { data, error } = await supabase.functions.invoke('manage-courses', {
          body: requestBody,
          headers: {
            'Content-Type': 'application/json'
          }
        })

        console.log('Edge function response:', { data, error })

        if (error) {
          console.error('Edge function error:', error)
          throw new Error(error.message || 'Failed to create course')
        }

        if (!data?.success) {
          console.error('Course creation failed:', data)
          throw new Error(data?.error || 'Failed to create course')
        }

        console.log('Course created successfully:', data.data)
        console.log('=== SIMPLE COURSE CREATOR DEBUG END ===')
        return data.data
      } catch (err) {
        console.error('Course creation error:', err)
        console.log('=== SIMPLE COURSE CREATOR DEBUG END WITH ERROR ===')
        throw err
      }
    },
    onSuccess: (data) => {
      console.log('Course creation success:', data)
      
      queryClient.invalidateQueries({ queryKey: ['simple-featured-courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['featured-courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      
      queryClient.refetchQueries({ queryKey: ['simple-featured-courses'] })
      
      toast({ 
        title: 'Success!',
        description: `Course "${data?.[0]?.title}" created and published successfully!`
      })
      
      setOpen(false)
      resetForm()
      
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['simple-featured-courses'] })
      }, 1000)
    },
    onError: (error: any) => {
      console.error('Course creation failed:', error)
      
      toast({
        title: 'Failed to create course',
        description: error.message || 'Unknown error occurred',
        variant: 'destructive'
      })
    }
  })

  const resetForm = () => {
      setFormData({
        title: '',
        description: '',
        price: '0',
        difficulty_level: 'beginner',
        thumbnail_url: '',
        is_published: true,
        duration_hours: '0',
        secret_group_link: '',
        available_batches: [''],
        category_id: ''
      })
      setImageFile(null)
      setImagePreview('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== SIMPLE FORM SUBMISSION DEBUG ===')
    console.log('Form data:', formData)
    console.log('isSuperAdmin:', isSuperAdmin)
    console.log('localStorage superAdminEmail:', localStorage.getItem('superAdminEmail'))
    
    // Check super admin authentication
    if (!isSuperAdmin) {
      console.error('Super admin authentication failed')
      toast({ 
        title: 'Authentication Required', 
        description: 'Please ensure you are logged in as a super admin.',
        variant: 'destructive' 
      })
      return
    }
    
    if (!formData.title.trim()) {
      console.error('Course title validation failed')
      toast({ 
        title: 'Course title is required', 
        description: 'Please enter a course title',
        variant: 'destructive' 
      })
      return
    }
    
    console.log('Validation passed, starting mutation...')
    createCourseMutation.mutate(formData)
  }

  const handleInputChange = (field: keyof CourseFormData, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addBatch = () => {
    setFormData(prev => ({
      ...prev,
      available_batches: [...prev.available_batches, '']
    }))
  }

  const removeBatch = (index: number) => {
    if (formData.available_batches.length > 1) {
      const newBatches = formData.available_batches.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, available_batches: newBatches }))
    }
  }

  const updateBatch = (index: number, value: string) => {
    const newBatches = [...formData.available_batches]
    newBatches[index] = value
    setFormData(prev => ({ ...prev, available_batches: newBatches }))
  }

  // Don't render if not super admin
  if (!isSuperAdmin) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Simple Course
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course (Ultra Simple)</DialogTitle>
          <DialogDescription>
            Create a new course with zero complexity - just fill and create!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (৳)</Label>
              <Input
                id="price"
                type="number"
                min="0"
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
                <SelectValue placeholder="Select category" />
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
            <Label htmlFor="image_upload">Thumbnail Image</Label>
            <div className="space-y-2">
              <Input
                id="image_upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    setImageFile(file)
                    const reader = new FileReader()
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string)
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-sm text-gray-500">
                Or enter image URL manually:
              </div>
              <Input
                id="thumbnail"
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secret_group_link">Secret Group Link (Optional)</Label>
            <Input
              id="secret_group_link"
              value={formData.secret_group_link}
              onChange={(e) => handleInputChange('secret_group_link', e.target.value)}
              placeholder="https://t.me/your-secret-group"
            />
          </div>

          <div className="space-y-4">
            <Label>Available Batches</Label>
            {formData.available_batches.map((batch, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={batch}
                  onChange={(e) => updateBatch(index, e.target.value)}
                  placeholder="e.g., HSC 25, HSC 26"
                />
                {formData.available_batches.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeBatch(index)}
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
              onClick={addBatch}
              className="w-full border-dashed border-blue-300 text-blue-600 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Batch
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="publish"
              checked={formData.is_published}
              onCheckedChange={(checked) => handleInputChange('is_published', checked)}
            />
            <Label htmlFor="publish">Publish immediately (Recommended)</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false)
                resetForm()
              }}
              disabled={createCourseMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCourseMutation.isPending || isUploading}
            >
              {createCourseMutation.isPending || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                'Create & Publish Course'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
