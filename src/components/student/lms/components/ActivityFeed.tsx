import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle, Clock, MessageSquare, Award, FileText, Calendar } from 'lucide-react'

interface ActivityItem {
  id: number
  type: 'assignment' | 'quiz' | 'message' | 'certificate' | 'course' | 'deadline'
  title: string
  description: string
  timestamp: string
  status?: 'completed' | 'pending' | 'overdue'
  avatar?: string
  instructor?: string
}

// Mock data - in real app this would come from API
const activities: ActivityItem[] = [
  {
    id: 1,
    type: 'quiz',
    title: 'JavaScript Quiz #3 Completed',
    description: 'Scored 92% on Functions and Scope quiz',
    timestamp: '2 hours ago',
    status: 'completed'
  },
  {
    id: 2,
    type: 'assignment',
    title: 'New Assignment Posted',
    description: 'React Component Refactoring - Due in 3 days',
    timestamp: '4 hours ago',
    status: 'pending',
    instructor: 'Sarah Johnson'
  },
  {
    id: 3,
    type: 'message',
    title: 'Message from Instructor',
    description: 'Great work on your latest project submission!',
    timestamp: '1 day ago',
    instructor: 'Mike Chen'
  },
  {
    id: 4,
    type: 'certificate',
    title: 'Certificate Earned',
    description: 'React Fundamentals Certificate - Download available',
    timestamp: '2 days ago',
    status: 'completed'
  },
  {
    id: 5,
    type: 'deadline',
    title: 'Assignment Deadline Reminder',
    description: 'Database Schema Design due tomorrow',
    timestamp: '3 days ago',
    status: 'overdue'
  },
  {
    id: 6,
    type: 'course',
    title: 'New Course Material',
    description: 'Advanced React Hooks - 3 new videos added',
    timestamp: '4 days ago',
    instructor: 'Emily Davis'
  }
]

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'assignment':
      return <FileText className="h-4 w-4" />
    case 'quiz':
      return <CheckCircle className="h-4 w-4" />
    case 'message':
      return <MessageSquare className="h-4 w-4" />
    case 'certificate':
      return <Award className="h-4 w-4" />
    case 'deadline':
      return <Calendar className="h-4 w-4" />
    case 'course':
      return <Clock className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="outline" className="text-green-600 border-green-200">Completed</Badge>
    case 'pending':
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Pending</Badge>
    case 'overdue':
      return <Badge variant="outline" className="text-red-600 border-red-200">Overdue</Badge>
    default:
      return null
  }
}

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {activity.timestamp}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
                
                {activity.instructor && (
                  <div className="flex items-center mt-2">
                    <Avatar className="h-5 w-5 mr-2">
                      <AvatarImage src={activity.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.instructor.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      {activity.instructor}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}