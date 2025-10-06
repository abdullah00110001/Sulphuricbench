
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Upload, X } from 'lucide-react'
import { useCourseCategories } from '@/hooks/useCourseCategories'

interface Course {
  id: string
  title: string
  description: string
  instructor_name: string
  thumbnail_url?: string
  price: number
  is_published: boolean
  is_featured: boolean
  enrollment_count: number
  duration_hours: number
  category_name: string
  category_id?: string
  difficulty_level: string
}

interface EditCourseFormProps {
  course: Course
  onSuccess: () => void
  onCancel: () => void
}

export function EditCourseForm({ course, onSuccess, onCancel }: EditCourseFormProps) {
  const [uploading, setUploading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(course.thumbnail_url || '')
  const [formData, setFormData] = useState({
    title: course.title,
    description: course.description || '',
    price: course.price.toString(),
    category_id: course.category_id || '',
    difficulty_level: course.difficulty_level || 'beginner',
    thumbnail_url: course.thumbnail_url || '',
    is_published: course.is_published,
    is_featured: course.is_featured,
    duration_hours: course.duration_hours?.toString() || '0'
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: categories = [], isLoading: categoriesLoading } = useCourseCategories()

  const updateCourseMutation = useMutation({
    mutationFn: async (updateData: typeof formData) => {
      console.log('Updating course:', course.id, updateData)
      
      let thumbnailUrl = updateData.thumbnail_url

      if (thumbnailFile) {
        console.log('Uploading new thumbnail image...')
        setUploading(true)
        try {
          const fileExt = thumbnailFile.name.split('.').pop()
          const fileName = `course-thumbnail-${Date.now()}.${fileExt}`
          
          const { data, error } = await supabase.storage
            .from('course-images')
            .upload(fileName, thumbnailFile)

          if (error) {
            throw new Error(`Failed to upload image: ${error.message}`)
          }

          const { data: { publicUrl } } = supabase.storage
            .from('course-images')
            .getPublicUrl(fileName)

          thumbnailUrl = publicUrl
          console.log('New thumbnail uploaded:', thumbnailUrl)
        } catch (error) {
          console.error('Image upload failed:', error)
          setUploading(false)
          throw error
        }
        setUploading(false)
      }

      const coursePayload = {
        title: updateData.title.trim(),
        description: updateData.description?.trim() || '',
        price: Math.max(0, parseFloat(updateData.price) || 0),
        category_id: updateData.category_id || null,
        difficulty_level: updateData.difficulty_level || 'beginner',
        thumbnail_url: thumbnailUrl,
        is_published: Boolean(updateData.is_published),
        is_featured: Boolean(updateData.is_featured),
        duration_hours: Math.max(0, parseInt(updateData.duration_hours) || 0)
      }

      console.log('Final course update payload:', coursePayload)

      const { data: updatedCourse, error } = await supabase
        .from('courses')
        .update(coursePayload)
        .eq('id', course.id)
        .select()

      if (error) {
        console.error('Course update error:', error)
        throw new Error(`Failed to update course: ${error.message}`)
      }

      console.log('Course updated successfully:', updatedCourse)
      return updatedCourse
    },
    onSuccess: (data) => {
      console.log('Course update success:', data)
      
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['featured-courses'] })
      
      toast({ 
        title: 'Course Updated Successfully!',
        description: `Course "${formData.title}" has been updated.`
      })
      
      onSuccess()
    },
    onError: (error: any) => {
      console.error('Course update failed:', error)
      setUploading(false)
      
      let errorMessage = 'An unexpected error occurred while updating the course.'
      
      if (error.message) {
        errorMessage = `Error: ${error.message}`
      }
      
      toast({
        title: 'Failed to update course',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Form submission:', formData)
    
    if (!formData.title?.trim()) {
      toast({ 
        title: 'Course title is required', 
        description: 'Please enter a course title',
        variant: 'destructive' 
      })
      return
    }

    console.log('Validation passed, updating course...')
    updateCourseMutation.mutate(formData)
  }

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
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

  const isFormValid = formData.title.trim().length > 0 && !updateCourseMutation.isPending && !uploading

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
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

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="publish"
            checked={formData.is_published}
            onCheckedChange={(checked) => handleInputChange('is_published', checked)}
          />
          <Label htmlFor="publish">Published</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch
            id="featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => handleInputChange('is_featured', checked)}
          />
          <Label htmlFor="featured">Featured</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!isFormValid}
          className="min-w-[120px]"
        >
          {uploading ? (
            'Uploading Image...'
          ) : updateCourseMutation.isPending ? (
            'Updating Course...'
          ) : (
            'Update Course'
          )}
        </Button>
      </div>
    </form>
  )
}
