
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/integrations/supabase/client'
import { Users, Mail, Calendar, BookOpen, Award, XCircle } from 'lucide-react'

interface Student {
  id: string
  full_name: string
  email: string
  avatar_url?: string
  created_at: string
  points: number
  level: number
  role: string
  approval_status: string
  phone?: string
  bio?: string
  location?: string
  website_url?: string
  last_sign_in_at?: string
  email_verified?: boolean
}

export default function StudentsPage() {
  // Fetch all users from the manage-users edge function to get merged data
  const { data: students = [], isLoading, error } = useQuery({
    queryKey: ['merged-students-users'],
    queryFn: async () => {
      console.log('Fetching merged students and users data...')
      
      // Get super admin email for authentication
      const superAdminEmail = localStorage.getItem('superAdminEmail')
      
      if (!superAdminEmail) {
        throw new Error('Super admin authentication required')
      }

      const response = await fetch(`https://idkwicblyakptcldiksf.supabase.co/functions/v1/manage-users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer super-admin-token-${superAdminEmail}`,
        },
        body: JSON.stringify({
          action: 'get_users',
          data: { role: 'student' } // Filter for students only
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error response:', errorData)
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Merged students data:', result.data)
      return result.data as Student[]
    }
  })

  const { data: enrollmentStats } = useQuery({
    queryKey: ['student-enrollment-stats'],
    queryFn: async () => {
      console.log('Fetching enrollment stats...')
      
      const { data, error } = await supabase
        .from('enrollments')
        .select('student_id, course_id, progress_percentage')

      if (error) {
        console.error('Error fetching enrollments:', error)
        return { activeStudents: 0, totalEnrollments: 0, completedCourses: 0 }
      }
      
      const activeStudents = new Set(data?.map(e => e.student_id)).size
      const totalEnrollments = data?.length || 0
      const completedCourses = data?.filter(e => e.progress_percentage === 100).length || 0
      
      console.log('Enrollment stats:', { activeStudents, totalEnrollments, completedCourses })
      
      return { activeStudents, totalEnrollments, completedCourses }
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Students page error:', error)
    return (
      <div className="text-center py-8">
        <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Students</h3>
        <p className="text-gray-600">Unable to fetch student data: {error.message}</p>
      </div>
    )
  }

  // Sort students by points for leaderboard
  const topStudents = [...students].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 10)

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Students & Users Management</h1>
          <p className="text-muted-foreground">Manage all student accounts and user data</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students/Users</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                <p className="text-2xl font-bold">{enrollmentStats?.activeStudents || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Enrollments</p>
                <p className="text-2xl font-bold">{enrollmentStats?.totalEnrollments || 0}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Courses</p>
                <p className="text-2xl font-bold">{enrollmentStats?.completedCourses || 0}</p>
              </div>
              <Award className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students table will be here */}

      {/* All Students */}
      <Card>
        <CardHeader>
          <CardTitle>All Students & Users ({students.length})</CardTitle>
          <CardDescription>Complete list of all user accounts (merged data)</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-gray-600">No user accounts have been created yet.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {students.map((student) => (
                <div key={student.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatar_url} />
                      <AvatarFallback>{student.full_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{student.full_name}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      {student.phone && (
                        <p className="text-xs text-muted-foreground">{student.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Level {student.level || 1}</Badge>
                      <Badge variant={student.role === 'student' ? 'default' : 'outline'}>
                        {student.role}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{student.points || 0} points</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(student.created_at).toLocaleDateString()}
                  </div>

                  {student.email_verified && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Mail className="h-4 w-4" />
                      Email Verified
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
