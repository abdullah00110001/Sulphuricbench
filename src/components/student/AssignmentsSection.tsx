
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { FileText, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string
  total_points: number
  course: {
    title: string
  }
  submission?: {
    id: string
    grade: number
    feedback: string
    submitted_at: string
  }
}

export function AssignmentsSection() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchAssignments()
    }
  }, [user])

  const fetchAssignments = async () => {
    try {
      // Since assignments table doesn't exist, we'll create mock data
      // In a real app, you would uncomment the Supabase query below after creating the assignments table
      
      // const { data, error } = await supabase
      //   .from('assignments')
      //   .select(`
      //     *,
      //     course:courses(title),
      //     assignment_submissions(id, grade, feedback, submitted_at)
      //   `)
      //   .eq('is_published', true)

      // For now, we'll use mock data
      const mockAssignments: Assignment[] = [
        {
          id: '1',
          title: 'Chemistry Lab Report',
          description: 'Complete the organic chemistry lab report on compound synthesis',
          due_date: '2024-01-15T23:59:00Z',
          total_points: 100,
          course: { title: 'Organic Chemistry' },
          submission: {
            id: 'sub1',
            grade: 85,
            feedback: 'Good work! Consider adding more detail to your methodology section.',
            submitted_at: '2024-01-14T10:30:00Z'
          }
        },
        {
          id: '2',
          title: 'Physics Problem Set',
          description: 'Solve problems 1-15 from Chapter 8: Thermodynamics',
          due_date: '2024-01-20T23:59:00Z',
          total_points: 50,
          course: { title: 'Physics 101' }
        }
      ]

      setAssignments(mockAssignments)
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (assignment: Assignment) => {
    if (assignment.submission?.grade !== undefined) {
      return <Badge variant="default">Graded</Badge>
    }
    
    if (assignment.submission) {
      return <Badge variant="secondary">Submitted</Badge>
    }

    const dueDate = new Date(assignment.due_date)
    const now = new Date()
    
    if (dueDate < now) {
      return <Badge variant="destructive">Overdue</Badge>
    }

    return <Badge variant="outline">Pending</Badge>
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return <div className="p-4">Loading assignments...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Assignments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No assignments yet</p>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{assignment.title}</h3>
                      {isOverdue(assignment.due_date) && !assignment.submission && (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {assignment.course?.title}
                    </p>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {assignment.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {assignment.total_points} points
                      </div>
                    </div>
                    
                    {assignment.submission?.grade !== undefined && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">Grade:</span>
                          <Badge variant="default">
                            {assignment.submission.grade}/{assignment.total_points}
                          </Badge>
                        </div>
                        <Progress 
                          value={(assignment.submission.grade / assignment.total_points) * 100} 
                          className="h-2" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 text-right">
                    {getStatusBadge(assignment)}
                    <div className="mt-2">
                      <Button size="sm" variant="outline">
                        {assignment.submission ? 'View Submission' : 'Submit'}
                      </Button>
                    </div>
                  </div>
                </div>
                
                {assignment.submission?.feedback && (
                  <div className="mt-3 p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Teacher Feedback:</p>
                    <p className="text-sm text-muted-foreground">
                      {assignment.submission.feedback}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
