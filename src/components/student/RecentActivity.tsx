
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  MessageCircle, 
  Award, 
  CheckCircle, 
  Clock,
  Activity
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'course_progress' | 'discussion' | 'certificate' | 'assignment' | 'login'
  title: string
  description: string
  timestamp: string
  metadata?: {
    course?: string
    progress?: number
    grade?: number
  }
}

const recentActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'course_progress',
    title: 'Completed lesson',
    description: 'React State Management with useState',
    timestamp: '2 hours ago',
    metadata: {
      course: 'React Fundamentals',
      progress: 75
    }
  },
  {
    id: '2',
    type: 'discussion',
    title: 'Posted in discussion',
    description: 'How to optimize React performance?',
    timestamp: '4 hours ago',
    metadata: {
      course: 'Advanced React'
    }
  },
  {
    id: '3',
    type: 'assignment',
    title: 'Assignment graded',
    description: 'Database Design Project',
    timestamp: '1 day ago',
    metadata: {
      course: 'Backend Development',
      grade: 92
    }
  },
  {
    id: '4',
    type: 'certificate',
    title: 'Certificate earned',
    description: 'JavaScript Fundamentals',
    timestamp: '2 days ago'
  },
  {
    id: '5',
    type: 'login',
    title: 'Previous login',
    description: 'Last session: 3 hours 45 minutes',
    timestamp: '1 day ago'
  }
]

export function RecentActivity() {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'course_progress':
        return <BookOpen className="h-4 w-4 text-blue-500" />
      case 'discussion':
        return <MessageCircle className="h-4 w-4 text-green-500" />
      case 'certificate':
        return <Award className="h-4 w-4 text-yellow-500" />
      case 'assignment':
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      case 'login':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'course_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'discussion':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'certificate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'assignment':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'login':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  {activity.metadata?.grade && (
                    <Badge variant="outline" className="text-xs">
                      {activity.metadata.grade}%
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-1">
                  {activity.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{activity.timestamp}</span>
                  {activity.metadata?.course && (
                    <>
                      <span>•</span>
                      <span>{activity.metadata.course}</span>
                    </>
                  )}
                  {activity.metadata?.progress && (
                    <>
                      <span>•</span>
                      <span>{activity.metadata.progress}% complete</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
