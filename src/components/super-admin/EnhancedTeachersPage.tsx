import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Users, Mail, Phone, Calendar, CheckCircle, Clock, XCircle, Plus, Search, Eye, Edit, Trash2, X } from 'lucide-react'
import { useState } from 'react'

interface Teacher {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  approval_status: string
  created_at: string
  bio?: string
}

interface TeacherFormData {
  full_name: string
  email: string
  phone: string
  bio: string
}

interface CourseFormData {
  title: string
  description: string
  price: number
  difficulty_level: string
  duration_hours: number
  instructors: string[]
  learning_outcomes: string[]
  about_course: string
  thumbnail_url?: string
  video_url?: string
}

export function EnhancedTeachersPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false)
  const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false)
  
  const [formData, setFormData] = useState<TeacherFormData>({
    full_name: '',
    email: '',
    phone: '',
    bio: ''
  })

  const [courseFormData, setCourseFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    price: 0,
    difficulty_level: 'beginner',
    duration_hours: 1,
    instructors: [],
    learning_outcomes: [''],
    about_course: '',
    thumbnail_url: '',
    video_url: ''
  })

  const { data: teachers = [], isLoading, error } = useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      console.log('Fetching teachers...')
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            phone,
            avatar_url,
            approval_status,
            created_at,
            bio
          `)
          .eq('role', 'teacher')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching teachers:', error)
          throw error
        }
        
        console.log('Teachers data:', data)
        return data as Teacher[]
      } catch (error) {
        console.error('Teachers query error:', error)
        throw error
      }
    }
  })

  const createTeacherMutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      // First try to create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: 'temp_password_123', // Temporary password - should be changed
        options: {
          data: {
            full_name: data.full_name,
            role: 'teacher'
          }
        }
      })

      let userId: string

      if (authError) {
        if (authError.message === 'User already registered') {
          // Find existing user by email
          const { data: existingProfiles, error: findError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', data.email)
            .single()

          if (findError || !existingProfiles) {
            throw new Error('User already exists but profile not found')
          }
          userId = existingProfiles.id
        } else {
          throw authError
        }
      } else {
        userId = authData.user?.id
        if (!userId) {
          throw new Error('Failed to create user account')
        }
      }

      // Update or insert the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: data.email,
          full_name: data.full_name,
          phone: data.phone || null,
          bio: data.bio || null,
          role: 'teacher',
          approval_status: 'approved'
        })

      if (profileError) throw profileError
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      toast({ title: 'Teacher created successfully!' })
      setIsCreateModalOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      console.error('Create teacher error:', error)
      toast({
        title: 'Failed to create teacher',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const updateTeacherMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<TeacherFormData> }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone || null,
          bio: data.bio || null
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      toast({ title: 'Teacher updated successfully!' })
      setIsEditModalOpen(false)
      resetForm()
    },
    onError: (error: any) => {
      console.error('Update teacher error:', error)
      toast({
        title: 'Failed to update teacher',
        description: error.message,
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

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      toast({ title: 'Teacher deleted successfully!' })
      setSelectedTeacher(null)
    },
    onError: (error: any) => {
      console.error('Delete teacher error:', error)
      toast({
        title: 'Failed to delete teacher',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const approveTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: 'approved' })
        .eq('id', teacherId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] })
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] })
      toast({ title: 'Teacher approved successfully!' })
    },
    onError: (error: any) => {
      console.error('Approval error:', error)
      toast({
        title: 'Failed to approve teacher',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const { error } = await supabase
        .from('courses')
        .insert({
          title: data.title,
          description: data.description,
          price: data.price,
          difficulty_level: data.difficulty_level,
          duration_hours: data.duration_hours,
          instructor_id: data.instructors[0] || null, // Primary instructor
          thumbnail_url: data.thumbnail_url || null,
          video_url: data.video_url || null,
          is_published: true,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // Here you would also handle multiple instructors, learning outcomes, etc.
      // This would require additional tables in your database schema
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      toast({ title: 'Course created successfully!' })
      setIsCourseModalOpen(false)
      setCourseFormData({
        title: '',
        description: '',
        price: 0,
        difficulty_level: 'beginner',
        duration_hours: 1,
        instructors: [],
        learning_outcomes: [''],
        about_course: '',
        thumbnail_url: '',
        video_url: ''
      })
    },
    onError: (error: any) => {
      console.error('Create course error:', error)
      toast({
        title: 'Failed to create course',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingTeachers = filteredTeachers.filter(t => t.approval_status === 'pending')
  const approvedTeachers = filteredTeachers.filter(t => t.approval_status === 'approved')

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      bio: ''
    })
  }

  const handleCreate = () => {
    setIsCreateModalOpen(true)
    resetForm()
  }

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setFormData({
      full_name: teacher.full_name,
      email: teacher.email,
      phone: teacher.phone || '',
      bio: teacher.bio || ''
    })
    setIsEditModalOpen(true)
  }

  const handleView = (teacher: Teacher) => {
    setSelectedTeacher(teacher)
    setIsViewModalOpen(true)
  }

  const handleDelete = (teacher: Teacher) => {
    if (window.confirm(`Are you sure you want to delete ${teacher.full_name}?`)) {
      deleteTeacherMutation.mutate(teacher.id)
    }
  }

  const addLearningOutcome = () => {
    setCourseFormData(prev => ({
      ...prev,
      learning_outcomes: [...prev.learning_outcomes, '']
    }))
  }

  const removeLearningOutcome = (index: number) => {
    setCourseFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.filter((_, i) => i !== index)
    }))
  }

  const updateLearningOutcome = (index: number, value: string) => {
    setCourseFormData(prev => ({
      ...prev,
      learning_outcomes: prev.learning_outcomes.map((outcome, i) => 
        i === index ? value : outcome
      )
    }))
  }

  const addInstructor = (instructorId: string) => {
    if (!courseFormData.instructors.includes(instructorId)) {
      setCourseFormData(prev => ({
        ...prev,
        instructors: [...prev.instructors, instructorId]
      }))
    }
    setIsInstructorModalOpen(false)
  }

  const removeInstructor = (instructorId: string) => {
    setCourseFormData(prev => ({
      ...prev,
      instructors: prev.instructors.filter(id => id !== instructorId)
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 md:p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Teachers page error:', error)
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Teachers</h3>
        <p className="text-gray-600 dark:text-gray-400">Unable to fetch teacher data: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-0 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Teachers Management</h1>
          <p className="text-muted-foreground">Manage teacher accounts, approvals, and course creation</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsCourseModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
          <Button onClick={handleCreate} className="bg-[#00CFFF] hover:bg-[#00B8E6]">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Teachers</p>
                <p className="text-xl md:text-2xl font-bold dark:text-white">{filteredTeachers.length}</p>
              </div>
              <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-xl md:text-2xl font-bold dark:text-white">{approvedTeachers.length}</p>
              </div>
              <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-xl md:text-2xl font-bold dark:text-white">{pendingTeachers.length}</p>
              </div>
              <Clock className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Search Results</p>
                <p className="text-xl md:text-2xl font-bold dark:text-white">{filteredTeachers.length}</p>
              </div>
              <Search className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Teachers List */}
      <Card>
        <CardHeader>
          <CardTitle className="dark:text-white">All Teachers ({filteredTeachers.length})</CardTitle>
          <CardDescription className="dark:text-gray-400">
            {searchTerm ? `Showing results for "${searchTerm}"` : 'Complete list of teacher accounts'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTeachers.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <Users className="h-12 w-12 md:h-16 md:w-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                {searchTerm ? 'No teachers found' : 'No Teachers Found'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? `No teachers match your search for "${searchTerm}".`
                  : 'No teacher accounts have been created yet.'
                }
              </p>
              <Button onClick={handleCreate} className="bg-[#00CFFF] hover:bg-[#00B8E6]">
                <Plus className="h-4 w-4 mr-2" />
                Add First Teacher
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredTeachers.map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-4 space-y-3 dark:border-gray-700 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12">
                        <AvatarImage src={teacher.avatar_url} />
                        <AvatarFallback className="bg-[#00CFFF] text-white">
                          {teacher.full_name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium dark:text-white text-sm md:text-base truncate">{teacher.full_name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{teacher.email}</p>
                      </div>
                    </div>
                    <Badge variant={teacher.approval_status === 'approved' ? 'default' : 'secondary'} className="text-xs">
                      {teacher.approval_status}
                    </Badge>
                  </div>
                  
                  {teacher.phone && (
                    <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-3 w-3 md:h-4 md:w-4" />
                      {teacher.phone}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                    Joined {new Date(teacher.created_at).toLocaleDateString()}
                  </div>
                  
                  {teacher.bio && (
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{teacher.bio}</p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(teacher)} className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(teacher)} className="flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(teacher)} className="text-red-600 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {teacher.approval_status === 'pending' && (
                    <Button 
                      size="sm" 
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => approveTeacherMutation.mutate(teacher.id)}
                      disabled={approveTeacherMutation.isPending}
                    >
                      Approve Teacher
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Course Creation Modal */}
      <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Create a comprehensive course with multiple instructors and learning outcomes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Course Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="course_title">Course Title</Label>
                <Input
                  id="course_title"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter course title"
                />
              </div>
              <div>
                <Label htmlFor="course_price">Price (৳)</Label>
                <Input
                  id="course_price"
                  type="number"
                  value={courseFormData.price}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  placeholder="0 for free course"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="course_description">Course Description</Label>
              <Textarea
                id="course_description"
                value={courseFormData.description}
                onChange={(e) => setCourseFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the course"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty_level">Difficulty Level</Label>
                <Select 
                  value={courseFormData.difficulty_level} 
                  onValueChange={(value) => setCourseFormData(prev => ({ ...prev, difficulty_level: value }))}
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
              <div>
                <Label htmlFor="duration_hours">Duration (Hours)</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  value={courseFormData.duration_hours}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, duration_hours: Number(e.target.value) }))}
                  placeholder="Course duration in hours"
                />
              </div>
            </div>

            {/* Course Media */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="thumbnail_url">Course Thumbnail URL</Label>
                <Input
                  id="thumbnail_url"
                  value={courseFormData.thumbnail_url}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, thumbnail_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="video_url">Preview Video URL</Label>
                <Input
                  id="video_url"
                  value={courseFormData.video_url}
                  onChange={(e) => setCourseFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>

            {/* Course Instructors Selection */}
            <div>
              <Label>Course Instructors</Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {courseFormData.instructors.map((instructorId) => {
                    const instructor = teachers.find(t => t.id === instructorId)
                    return instructor ? (
                      <div key={instructorId} className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={instructor.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {instructor.full_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{instructor.full_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInstructor(instructorId)}
                          className="h-auto p-0 hover:bg-transparent"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : null
                  })}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsInstructorModalOpen(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Instructor
                </Button>
              </div>
            </div>

            {/* What You'll Learn Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>What you will learn by doing this course</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLearningOutcome}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-2">
                {courseFormData.learning_outcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={outcome}
                      onChange={(e) => updateLearningOutcome(index, e.target.value)}
                      placeholder="Learning outcome"
                      className="flex-1"
                    />
                    {courseFormData.learning_outcomes.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeLearningOutcome(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* About this Course */}
            <div>
              <Label htmlFor="about_course">About this Course</Label>
              <Textarea
                id="about_course"
                value={courseFormData.about_course}
                onChange={(e) => setCourseFormData(prev => ({ ...prev, about_course: e.target.value }))}
                placeholder="Detailed description about the course, its objectives, target audience, and benefits..."
                rows={6}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={() => createCourseMutation.mutate(courseFormData)}
                disabled={createCourseMutation.isPending || !courseFormData.title || !courseFormData.description}
                className="flex-1"
              >
                {createCourseMutation.isPending ? 'Creating...' : 'Create Course'}
              </Button>
              <Button variant="outline" onClick={() => setIsCourseModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Instructor Selection Modal */}
      <Dialog open={isInstructorModalOpen} onOpenChange={setIsInstructorModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Instructor</DialogTitle>
            <DialogDescription>
              Choose from existing teacher profiles to assign as course instructor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search teachers..."
                className="pl-10"
              />
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {teachers.filter(teacher => teacher.approval_status === 'approved').map((teacher) => (
                <div 
                  key={teacher.id} 
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => addInstructor(teacher.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={teacher.avatar_url} />
                      <AvatarFallback className="bg-[#00CFFF] text-white">
                        {teacher.full_name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium dark:text-white">{teacher.full_name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{teacher.email}</p>
                    </div>
                  </div>
                  <Button size="sm" className="bg-[#00CFFF] hover:bg-[#00B8E6]">
                    Select
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Teacher Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Teacher</DialogTitle>
            <DialogDescription>
              Add a new teacher to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Enter teacher bio"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => createTeacherMutation.mutate(formData)}
                disabled={createTeacherMutation.isPending || !formData.full_name || !formData.email}
                className="flex-1"
              >
                {createTeacherMutation.isPending ? 'Creating...' : 'Create Teacher'}
              </Button>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Teacher Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>
              Update teacher information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_full_name">Full Name</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="edit_phone">Phone</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <Label htmlFor="edit_bio">Bio</Label>
              <Textarea
                id="edit_bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Enter teacher bio"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => selectedTeacher && updateTeacherMutation.mutate({ id: selectedTeacher.id, data: formData })}
                disabled={updateTeacherMutation.isPending || !formData.full_name || !formData.email}
                className="flex-1"
              >
                {updateTeacherMutation.isPending ? 'Updating...' : 'Update Teacher'}
              </Button>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Teacher Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Teacher Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedTeacher?.full_name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedTeacher && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 md:h-20 md:w-20">
                  <AvatarImage src={selectedTeacher.avatar_url} />
                  <AvatarFallback className="text-lg md:text-xl bg-[#00CFFF] text-white">
                    {selectedTeacher.full_name?.split(' ').map(n => n[0]).join('') || 'T'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl md:text-2xl font-bold dark:text-white">{selectedTeacher.full_name}</h3>
                  <div className="flex gap-2">
                    <Badge className={selectedTeacher.approval_status === 'approved' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"}>
                      {selectedTeacher.approval_status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold dark:text-white">Email</h4>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">{selectedTeacher.email}</p>
                </div>
                
                {selectedTeacher.phone && (
                  <div className="space-y-2">
                    <h4 className="font-semibold dark:text-white">Phone</h4>
                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded">{selectedTeacher.phone}</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              {selectedTeacher.bio && (
                <div className="space-y-2">
                  <h4 className="font-semibold dark:text-white">Bio</h4>
                  <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded leading-relaxed">
                    {selectedTeacher.bio}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div>
                  <strong>Joined:</strong><br />
                  {new Date(selectedTeacher.created_at).toLocaleString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={() => handleEdit(selectedTeacher)} className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Teacher
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleDelete(selectedTeacher)}
                  className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
