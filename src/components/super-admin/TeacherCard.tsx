
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, User, CheckCircle, Ban, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useSuperAdminAuth } from '@/hooks/useSuperAdminAuth'

interface Teacher {
  id: string
  full_name: string
  email: string
  institution?: string
  bio?: string
  image_url?: string
  experience_years: number
  is_active: boolean
  created_at: string
  updated_at: string
}

interface TeacherCardProps {
  teacher: Teacher
  onEdit: (teacher: Teacher) => void
  onDelete: (teacherId: string) => void
  onToggleStatus: (teacherId: string, currentStatus: boolean) => void
  isDeleting: boolean
}

export function TeacherCard({ teacher, onEdit, onDelete, onToggleStatus, isDeleting }: TeacherCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { user } = useSuperAdminAuth()

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = () => {
    console.log('Confirming delete for teacher:', teacher.id)
    onDelete(teacher.id)
    setShowDeleteDialog(false)
  }

  // Don't show action buttons if not super admin
  if (!user) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{teacher.full_name}</CardTitle>
          <CardDescription className="line-clamp-1">
            {teacher.email}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{teacher.full_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{teacher.email}</span>
              </div>
            </div>
            
            <div className="text-sm">
              <p>
                <strong>Status:</strong>
                {teacher.is_active ? (
                  <Badge variant="outline" className="ml-1 bg-green-100 text-green-600 border-green-600">
                    Active <CheckCircle className="w-3 h-3 ml-1" />
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-1 bg-red-100 text-red-600 border-red-600">
                    Inactive <Ban className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </p>
              <p><strong>Experience:</strong> {teacher.experience_years} years</p>
              <p><strong>Created:</strong> {new Date(teacher.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg line-clamp-1">{teacher.full_name}</CardTitle>
          <CardDescription className="line-clamp-1">
            {teacher.email}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{teacher.full_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>{teacher.email}</span>
              </div>
            </div>
            
            <div className="text-sm">
              <p>
                <strong>Status:</strong>
                {teacher.is_active ? (
                  <Badge variant="outline" className="ml-1 bg-green-100 text-green-600 border-green-600">
                    Active <CheckCircle className="w-3 h-3 ml-1" />
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-1 bg-red-100 text-red-600 border-red-600">
                    Inactive <Ban className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </p>
              <p><strong>Experience:</strong> {teacher.experience_years} years</p>
              <p><strong>Created:</strong> {new Date(teacher.created_at).toLocaleDateString()}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(teacher)}
                className="flex-1"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              
              <Button
                size="sm"
                variant={teacher.is_active ? "secondary" : "default"}
                onClick={() => onToggleStatus(teacher.id, teacher.is_active)}
                className="flex-1"
              >
                {teacher.is_active ? 'Deactivate' : 'Activate'}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Permanently Delete Teacher</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{teacher.full_name}"? 
              This will also:
              <br />• Remove them from all course assignments
              <br />• Update any courses where they are the instructor
              <br />• Clean up all associated teacher-course relationships
              <br /><br />
              <strong>This action cannot be undone.</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting Teacher...' : 'Permanently Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
