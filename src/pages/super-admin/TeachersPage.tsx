
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Plus, Trash2, Edit, Mail, Phone, Globe, User } from 'lucide-react'

interface Teacher {
  id: string
  full_name: string
  email: string
  phone?: string
  bio?: string
  website_url?: string
  avatar_url?: string
  role: string
  approval_status: string
  created_at: string
}

export default function TeachersPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newTeacher, setNewTeacher] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: ''
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'teacher')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching teachers:', error)
        throw error
      }

      return data as Teacher[]
    }
  })

  const createTeacherMutation = useMutation({
    mutationFn: async (teacherData: typeof newTeacher) => {
      // Generate UUID for the teacher
      const teacherId = crypto.randomUUID()
      
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: teacherId,
          email: teacherData.email,
          full_name: teacherData.full_name,
          phone: teacherData.phone || null,
          bio: teacherData.bio || null,
          role: 'teacher',
          approval_status: 'approved'
        })
        .select()

      if (error) {
        console.error('Teacher creation error:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      toast({
        title: 'Teacher created successfully',
        description: 'New teacher has been added to the platform'
      })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      setIsCreateModalOpen(false)
      setNewTeacher({ full_name: '', email: '', phone: '', bio: '' })
    },
    onError: (error: any) => {
      console.error('Create teacher error:', error)
      toast({
        title: 'Failed to create teacher',
        description: error.message || 'An error occurred while creating the teacher.',
        variant: 'destructive'
      })
    }
  })

  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', teacherId)

      if (error) {
        throw error
      }
    },
    onSuccess: () => {
      toast({
        title: 'Teacher deleted successfully',
        description: 'Teacher has been removed from the platform'
      })
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
    },
    onError: (error: any) => {
      console.error('Delete teacher error:', error)
      toast({
        title: 'Failed to delete teacher',
        description: error.message || 'An error occurred while deleting the teacher.',
        variant: 'destructive'
      })
    }
  })

  const handleCreateTeacher = () => {
    if (!newTeacher.full_name.trim() || !newTeacher.email.trim()) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      })
      return
    }

    createTeacherMutation.mutate(newTeacher)
  }

  const handleDeleteTeacher = (teacherId: string) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      deleteTeacherMutation.mutate(teacherId)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Teachers</h1>
            <p className="text-muted-foreground">Manage platform teachers</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-64"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>
          <p className="text-muted-foreground">Manage platform teachers</p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00CFFF] hover:bg-[#00B8E6]">
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Teacher</DialogTitle>
              <DialogDescription>
                Create a new teacher profile for the platform
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={newTeacher.full_name}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter teacher's full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter teacher's email"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newTeacher.phone}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter teacher's phone number"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={newTeacher.bio}
                  onChange={(e) => setNewTeacher(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Enter teacher's bio"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeacher}
                  disabled={createTeacherMutation.isPending}
                  className="bg-[#00CFFF] hover:bg-[#00B8E6]"
                >
                  {createTeacherMutation.isPending ? 'Creating...' : 'Create Teacher'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <Card key={teacher.id} className="group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={teacher.avatar_url} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{teacher.full_name}</CardTitle>
                    <Badge variant="secondary" className="mt-1">
                      {teacher.approval_status}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTeacher(teacher.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                {teacher.phone && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{teacher.phone}</span>
                  </div>
                )}
                {teacher.website_url && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">{teacher.website_url}</span>
                  </div>
                )}
                {teacher.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {teacher.bio}
                  </p>
                )}
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Joined: {new Date(teacher.created_at).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teachers.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Teachers Found</h3>
            <p className="text-muted-foreground mb-4">
              No teachers have been added to the platform yet.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} className="bg-[#00CFFF] hover:bg-[#00B8E6]">
              <Plus className="h-4 w-4 mr-2" />
              Add First Teacher
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
