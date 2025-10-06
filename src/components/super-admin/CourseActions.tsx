
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Edit, Trash2, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { EditCourseForm } from './EditCourseForm'
import { useAuth } from '@/hooks/useAuth'

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

interface CourseActionsProps {
  course: Course
  onRefresh: () => void
}

interface DeleteResponse {
  success: boolean
  error?: string
  message?: string
  deletion_log?: Record<string, number>
}

export function CourseActions({ course, onRefresh }: CourseActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { isSuperAdmin } = useAuth()

  const deleteMutation = useMutation({
    mutationFn: async (courseId: string) => {
      console.log('=== STARTING COURSE CASCADE DELETE ===')
      console.log('Course ID to delete:', courseId)
      
      // Verify super admin authentication
      if (!isSuperAdmin) {
        throw new Error('Only super admins can delete courses. Please check your authentication.')
      }

      console.log('Super admin authentication verified, proceeding with deletion...')

      // Use the new cascade deletion function
      const { data, error } = await supabase.rpc('delete_course_cascade' as any, {
        course_id_param: courseId
      })

      console.log('Cascade deletion response:', { data, error })

      if (error) {
        console.error('Database function error:', error)
        throw new Error(`Database error: ${error.message}`)
      }

      const response = (data as unknown) as DeleteResponse
      
      if (!response?.success) {
        console.error('Deletion failed:', response)
        throw new Error(response?.error || 'Course deletion failed')
      }

      console.log('=== COURSE CASCADE DELETE COMPLETED SUCCESSFULLY ===')
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
        title: 'Course Deleted Successfully',
        description: `Course "${course.title}" and all related data have been permanently removed. ${statsMessage ? `Cleaned up: ${statsMessage}` : ''}`
      })

      // Refresh all relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['featured-courses'] })
      
      setShowDeleteDialog(false)
      onRefresh()
    },
    onError: (error: any) => {
      console.error('Delete course mutation error:', error)
      
      let errorMessage = 'An unexpected error occurred while deleting the course.'
      
      if (error.message) {
        errorMessage = error.message
      }
      
      toast({
        title: 'Course Deletion Failed',
        description: errorMessage,
        variant: 'destructive'
      })
    }
  })

  const handleDelete = () => {
    console.log('Handle delete called for course:', course.id)
    deleteMutation.mutate(course.id)
  }

  const handleEditSuccess = () => {
    setShowEditDialog(false)
    onRefresh()
  }

  // Don't show delete button if not super admin
  if (!isSuperAdmin) {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowViewDialog(true)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditDialog(true)}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowViewDialog(true)}
          className="flex-1"
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowEditDialog(true)}
          className="flex-1"
        >
          <Edit className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowDeleteDialog(true)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{course.title}"? 
              This will completely remove the course and ALL associated data including:
              <br />• All student enrollments and progress
              <br />• All course modules and materials  
              <br />• All ratings and reviews
              <br />• All payments and invoices
              <br />• All certificates issued
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
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting Course...' : 'Permanently Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course information below
            </DialogDescription>
          </DialogHeader>
          
          <EditCourseForm 
            course={course}
            onSuccess={handleEditSuccess}
            onCancel={() => setShowEditDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* View Course Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>
              Complete information about {course.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Course Image */}
            {course.thumbnail_url && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Course Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold">{course.title}</h3>
                <p className="text-muted-foreground mt-2">{course.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Instructor:</strong> {course.instructor_name}
                </div>
                <div>
                  <strong>Category:</strong> {course.category_name}
                </div>
                <div>
                  <strong>Price:</strong> ৳{course.price.toLocaleString()}
                </div>
                <div>
                  <strong>Duration:</strong> {course.duration_hours}h
                </div>
                <div>
                  <strong>Difficulty:</strong> {course.difficulty_level}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{course.enrollment_count} students</span>
                </div>
              </div>

              <div className="flex gap-2">
                {course.is_published && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    Published
                  </span>
                )}
                {course.is_featured && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                    Featured
                  </span>
                )}
                {!course.is_published && (
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                    Draft
                  </span>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
