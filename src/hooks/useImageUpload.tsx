
import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const uploadImage = async (file: File, bucket: string = 'course-images'): Promise<string | null> => {
    setIsUploading(true)
    
    try {
      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      const maxSize = 5 * 1024 * 1024 // 5MB
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.')
      }
      
      if (file.size > maxSize) {
        throw new Error('File too large. Please upload an image smaller than 5MB.')
      }
      
      // Generate a unique filename with timestamp
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      
      console.log('Uploading to bucket:', bucket, 'File:', fileName)
      
      // Use service role client for upload to bypass RLS
      const { data, error } = await supabase.functions.invoke('upload-file', {
        body: {
          bucket: bucket,
          fileName: fileName,
          fileData: await fileToBase64(file),
          contentType: file.type
        }
      })

      if (error) {
        console.error('Upload function error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      if (!data?.success) {
        console.error('Upload failed:', data)
        throw new Error(data?.error || 'Failed to upload image')
      }

      console.log('Upload successful:', data.publicUrl)
      return data.publicUrl
    } catch (error: any) {
      console.error('Image upload error:', error)
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image. Please try again.',
        variant: 'destructive'
      })
      return null
    } finally {
      setIsUploading(false)
    }
  }

  return {
    uploadImage,
    isUploading
  }
}

// Helper function to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:image/jpeg;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = error => reject(error)
  })
}
