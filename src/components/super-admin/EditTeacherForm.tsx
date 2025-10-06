
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Loader2 } from 'lucide-react'

interface Teacher {
  id: string
  full_name: string
  institution?: string
  bio?: string
  image_url?: string
  experience_years: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface EditTeacherFormProps {
  teacher: Teacher
  onSuccess: () => void
  onCancel: () => void
}

export function EditTeacherForm({ teacher, onSuccess, onCancel }: EditTeacherFormProps) {
  const [formData, setFormData] = useState({
    full_name: teacher.full_name || '',
    institution: teacher.institution || '',
    experience_years: teacher.experience_years || 0,
    bio: teacher.bio || '',
    image_url: teacher.image_url || '',
    is_active: teacher.is_active
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(teacher.image_url || '')

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { uploadImage, isUploading } = useImageUpload()

  const updateTeacherMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let finalImageUrl = data.image_url

      // Upload new image if file is selected
      if (imageFile) {
        try {
          const uploadedUrl = await uploadImage(imageFile, 'teacher-images')
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl
          }
        } catch (error) {
          console.error('Image upload failed:', error)
          // Continue with existing image if upload fails
        }
      }

      const { error } = await supabase
        .from('teachers')
        .update({
          full_name: data.full_name,
          institution: data.institution || null,
          experience_years: data.experience_years,
          bio: data.bio || null,
          image_url: finalImageUrl || null,
          is_active: data.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', teacher.id)

      if (error) {
        throw new Error('Failed to update teacher: ' + error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast({
        title: 'Teacher Updated',
        description: 'Teacher information has been successfully updated'
      })
      onSuccess()
    },
    onError: (error: any) => {
      console.error('Teacher update error:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.full_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Full name is required',
        variant: 'destructive'
      })
      return
    }

    updateTeacherMutation.mutate(formData)
  }

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            value={formData.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            placeholder="Enter teacher's full name"
            required
          />
        </div>

        <div>
          <Label htmlFor="institution">Institution</Label>
          <Input
            id="institution"
            value={formData.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
            placeholder="Enter institution name"
          />
        </div>

        <div>
          <Label htmlFor="experience_years">Experience (Years)</Label>
          <Input
            id="experience_years"
            type="number"
            min="0"
            value={formData.experience_years}
            onChange={(e) => handleChange('experience_years', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Brief description about the teacher"
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="image_upload">Profile Image</Label>
          <div className="space-y-2">
            <Input
              id="image_upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
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
              value={formData.image_url}
              onChange={(e) => handleChange('image_url', e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleChange('is_active', checked)}
          />
          <Label htmlFor="is_active">Active Status</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={updateTeacherMutation.isPending || isUploading}
          className="bg-[#00CFFF] hover:bg-[#00B8E6]"
        >
          {updateTeacherMutation.isPending || isUploading ? (
            <>
              <Loader2 className="w-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Teacher'
          )}
        </Button>
      </div>
    </form>
  )
}
