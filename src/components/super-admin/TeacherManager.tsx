
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Plus, User, Briefcase, GraduationCap, MapPin, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { useTeachers, Teacher } from '@/hooks/useTeachers'
import { useAuth } from '@/hooks/useAuth'
import { useImageUpload } from '@/hooks/useImageUpload'

interface DeleteResponse {
  success: boolean
  error?: string
  message?: string
  deletion_log?: Record<string, number>
}

export function TeacherManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [newTeacher, setNewTeacher] = useState({
    full_name: '',
    bio: '',
    qualifications: '',
    specializations: '',
    experience_years: 0,
    institution: ''
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { data: teachers = [] } = useTeachers()
  const { isSuperAdmin } = useAuth()
  const { uploadImage, isUploading } = useImageUpload()

  const createMutation = useMutation({
    mutationFn: async (teacherData: typeof newTeacher) => {
      let finalImageUrl = ''

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

      const { error } = await supabase
        .from('teachers')
        .insert([{
          ...teacherData,
          specializations: teacherData.specializations.split(',').map(s => s.trim()).filter(Boolean),
          image_url: finalImageUrl || null
        }])

      if (error) throw error
    },
    onSuccess: () => {
      toast({
        title: 'Teacher Created',
        description: 'Teacher has been successfully created.'
      })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      setShowCreateDialog(false)
      setNewTeacher({
        full_name: '',
        bio: '',
        qualifications: '',
        specializations: '',
        experience_years: 0,
        institution: ''
      })
      setImageFile(null)
      setImagePreview('')
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create teacher',
        variant: 'destructive'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      console.log('=== STARTING TEACHER CASCADE DELETE ===')
      console.log('Teacher ID to delete:', teacherId)
      
      // Verify super admin authentication
      if (!isSuperAdmin) {
        throw new Error('Only super admins can delete teachers. Please check your authentication.')
      }

      console.log('Super admin authentication verified, proceeding with deletion...')

      // Use the new cascade deletion function
      const { data, error } = await supabase.rpc('delete_teacher_cascade' as any, {
        teacher_id_param: teacherId
      })

      console.log('Cascade deletion response:', { data, error })

      if (error) {
        console.error('Database function error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      const response = (data as unknown) as DeleteResponse
      
      if (!response?.success) {
        console.error('Deletion failed:', response)
        throw new Error(response?.error || 'Teacher deletion failed')
      }

      console.log('=== TEACHER CASCADE DELETE COMPLETED SUCCESSFULLY ===')
      console.log('Deletion log:', response.deletion_log)
      
      return response
    },
    onSuccess: (data: DeleteResponse) => {
      console.log('Delete mutation success:', data)
      
      // Show detailed success message
      const deletionStats = data.deletion_log || {}
      const statsMessage = Object.entries(deletionStats)
        .filter(([_, count]) => typeof count === 'number' && (count as number) > 0)
        .map(([table, count]) => `${table}: ${count}`)
        .join(', ')

      toast({
        title: 'Teacher Deleted Successfully',
        description: `Teacher "${selectedTeacher?.full_name}" and all related data have been permanently removed. ${statsMessage ? `Cleaned up: ${statsMessage}` : ''}`
      })

      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      setShowDeleteDialog(false)
      setSelectedTeacher(null)
    },
    onError: (error: any) => {
      console.error('Delete teacher mutation error:', error)
      
      let errorMessage = 'An unexpected error occurred while deleting the teacher.'
      
      if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: 'Teacher Deletion Failed',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  })

  const handleDelete = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    if (selectedTeacher) {
      deleteMutation.mutate(selectedTeacher.id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teacher Management</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-4">
                {teacher.image_url ? (
                  <img
                    src={teacher.image_url}
                    alt={teacher.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{teacher.full_name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {teacher.institution || 'Teacher'}
                </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {teacher.bio && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                  {teacher.bio}
                </p>
              )}

              <div className="space-y-2">
                {teacher.institution && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{teacher.institution}</span>
                  </div>
                )}

                {teacher.experience_years !== undefined && (
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span>{teacher.experience_years} years experience</span>
                  </div>
                )}

                {teacher.qualifications && (
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="w-4 h-4 text-gray-500" />
                    <span className="truncate">{teacher.qualifications}</span>
                  </div>
                )}
              </div>

              {teacher.specializations && teacher.specializations.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {teacher.specializations.slice(0, 3).map((spec, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                  {teacher.specializations.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{teacher.specializations.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <Badge variant={teacher.is_active ? "default" : "secondary"}>
                  {teacher.is_active ? "Active" : "Inactive"}
                </Badge>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(teacher)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Teacher Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>
              Create a new teacher profile with their information and qualifications.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={newTeacher.full_name}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={newTeacher.bio}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Brief description about the teacher"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="qualifications">Qualifications</Label>
              <Input
                id="qualifications"
                value={newTeacher.qualifications}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, qualifications: e.target.value }))}
                placeholder="Educational qualifications"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_years">Experience (Years)</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={newTeacher.experience_years}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                  placeholder="Years of experience"
                />
              </div>
              <div>
                <Label htmlFor="institution">Institution</Label>
                <Input
                  id="institution"
                  value={newTeacher.institution}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="Current institution"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="specializations">Specializations</Label>
              <Input
                id="specializations"
                value={newTeacher.specializations}
                onChange={(e) => setNewTeacher(prev => ({ ...prev, specializations: e.target.value }))}
                placeholder="Comma-separated specializations (e.g. Mathematics, Physics)"
              />
            </div>

            <div>
              <Label htmlFor="image_upload">Profile Image</Label>
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
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={() => createMutation.mutate(newTeacher)}
              disabled={createMutation.isPending || isUploading || !newTeacher.full_name}
            >
              {createMutation.isPending || isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Creating...'}
                </>
              ) : (
                'Create Teacher'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{selectedTeacher?.full_name}"? 
              This will completely remove the teacher and ALL associated data including:
              <br />• All courses taught by this teacher
              <br />• All course materials and modules
              <br />• All student enrollments in their courses
              <br />• All ratings and reviews
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting Teacher...' : 'Permanently Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
