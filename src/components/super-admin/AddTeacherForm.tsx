
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useImageUpload } from '@/hooks/useImageUpload'
import { Loader2 } from 'lucide-react'

interface AddTeacherFormProps {
  onSuccess: () => void
}

export function AddTeacherForm({ onSuccess }: AddTeacherFormProps) {
  const [formData, setFormData] = useState({
    full_name: '',
    institution: '',
    experience_years: 0,
    bio: '',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { uploadImage, isUploading } = useImageUpload()

  const createTeacherMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      let finalImageUrl = data.image_url

      // Upload image if file is selected
      if (imageFile) {
        try {
          const uploadedUrl = await uploadImage(imageFile, 'teacher-images')
          if (uploadedUrl) {
            finalImageUrl = uploadedUrl
          }
        } catch (error) {
          console.error('Image upload failed:', error)
          // Continue without image if upload fails
        }
      }

      console.log('Creating teacher with data:', {
        full_name: data.full_name,
        institution: data.institution || null,
        experience_years: data.experience_years,
        bio: data.bio || null,
        image_url: finalImageUrl || null,
        is_active: true
      })

      const { data: result, error } = await supabase
        .from('teachers')
        .insert([{
          full_name: data.full_name,
          institution: data.institution || null,
          experience_years: data.experience_years,
          bio: data.bio || null,
          image_url: finalImageUrl || null,
          is_active: true
        }])
        .select()

      if (error) {
        console.error('Supabase error:', error)
        throw new Error('Failed to create teacher: ' + error.message)
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast({
        title: 'Teacher Added',
        description: 'Teacher has been successfully added to the system'
      })
      onSuccess()
      
      // Reset form
      setFormData({
        full_name: '',
        institution: '',
        experience_years: 0,
        bio: '',
        image_url: ''
      })
      setImageFile(null)
      setImagePreview('')
    },
    onError: (error: any) => {
      console.error('Teacher creation error:', error)
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

    createTeacherMutation.mutate(formData)
  }

  const handleChange = (field: string, value: string | number) => {
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
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={createTeacherMutation.isPending || isUploading}
          className="bg-[#00CFFF] hover:bg-[#00B8E6]"
        >
          {createTeacherMutation.isPending || isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isUploading ? 'Uploading...' : 'Creating...'}
            </>
          ) : (
            'Create Teacher'
          )}
        </Button>
      </div>
    </form>
  )
}
