import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface Deadline {
  id: number
  title: string
  course: string
  dueDate: string
  dueTime: string
  type: 'assignment' | 'quiz' | 'project' | 'exam'
  status: 'safe' | 'warning' | 'urgent' | 'overdue'
  submitted?: boolean
}

// Mock data - in real app this would come from API
const deadlines: Deadline[] = [
  {
    id: 1,
    title: 'React Component Assignment',
    course: 'React Fundamentals',
    dueDate: 'Today',
    dueTime: '11:59 PM',
    type: 'assignment',
    status: 'urgent',
    submitted: false
  },
  {
    id: 2,
    title: 'JavaScript Quiz #4',
    course: 'Advanced JavaScript',
    dueDate: 'Tomorrow',
    dueTime: '2:00 PM',
    type: 'quiz',
    status: 'warning',
    submitted: false
  },
  {
    id: 3,
    title: 'Database Schema Project',
    course: 'Database Design',
    dueDate: 'Jan 18',
    dueTime: '11:59 PM',
    type: 'project',
    status: 'safe',
    submitted: true
  },
  {
    id: 4,
    title: 'UI/UX Prototype',
    course: 'UI/UX Design',
    dueDate: 'Jan 20',
    dueTime: '5:00 PM',
    type: 'assignment',
    status: 'safe',
    submitted: false
  },
  {
    id: 5,
    title: 'Midterm Exam',
    course: 'Computer Science',
    dueDate: 'Jan 22',
    dueTime: '10:00 AM',
    type: 'exam',
    status: 'warning',
    submitted: false
  }
]

const getStatusColor = (status: Deadline['status']) => {
  switch (status) {
    case 'safe':
      return 'text-green-600 border-green-200 bg-green-50'
    case 'warning':
      return 'text-orange-600 border-orange-200 bg-orange-50'
    case 'urgent':
      return 'text-red-600 border-red-200 bg-red-50'
    case 'overdue':
      return 'text-red-700 border-red-300 bg-red-100'
    default:
      return 'text-gray-600 border-gray-200 bg-gray-50'
  }
}

const getStatusIcon = (status: Deadline['status'], submitted: boolean) => {
  if (submitted) {
    return <CheckCircle2 className="h-4 w-4 text-green-600" />
  }
  
  switch (status) {
    case 'urgent':
    case 'overdue':
      return <AlertTriangle className="h-4 w-4 text-red-600" />
    case 'warning':
      return <Clock className="h-4 w-4 text-orange-600" />
    case 'safe':
      return <Calendar className="h-4 w-4 text-green-600" />
    default:
      return <Calendar className="h-4 w-4 text-gray-600" />
  }
}

export function UpcomingDeadlines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                {getStatusIcon(deadline.status, deadline.submitted || false)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-medium">{deadline.title}</h4>
                    {deadline.submitted && (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        Submitted
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {deadline.course}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{deadline.dueDate} at {deadline.dueTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Badge 
                  variant="outline" 
                  className={getStatusColor(deadline.status)}
                >
                  {deadline.status}
                </Badge>
                {!deadline.submitted && (
                  <Button size="sm" variant="outline">
                    {deadline.type === 'exam' ? 'Start' : 'Submit'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}