
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Video, Users } from 'lucide-react'

interface UpcomingClass {
  id: string
  title: string
  instructor: string
  course: string
  date: string
  time: string
  duration: number
  type: 'live' | 'recorded'
  attendees: number
  maxAttendees: number
}

const upcomingClasses: UpcomingClass[] = [
  {
    id: '1',
    title: 'Advanced React Hooks',
    instructor: 'Dr. Sarah Johnson',
    course: 'React Fundamentals',
    date: '2024-01-15',
    time: '14:00',
    duration: 90,
    type: 'live',
    attendees: 24,
    maxAttendees: 30
  },
  {
    id: '2',
    title: 'Database Optimization',
    instructor: 'Prof. Mike Chen',
    course: 'Backend Development',
    date: '2024-01-16',
    time: '10:30',
    duration: 120,
    type: 'live',
    attendees: 18,
    maxAttendees: 25
  },
  {
    id: '3',
    title: 'Design Systems Workshop',
    instructor: 'Emma Williams',
    course: 'UI/UX Design',
    date: '2024-01-17',
    time: '16:00',
    duration: 60,
    type: 'recorded',
    attendees: 0,
    maxAttendees: 0
  }
]

export function UpcomingClasses() {
  const isToday = (date: string) => {
    const today = new Date().toDateString()
    const classDate = new Date(date).toDateString()
    return today === classDate
  }

  const isTomorrow = (date: string) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const classDate = new Date(date).toDateString()
    return tomorrow.toDateString() === classDate
  }

  const formatDate = (date: string) => {
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Upcoming Classes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{classItem.title}</h3>
                    {isToday(classItem.date) && (
                      <Badge variant="default">Today</Badge>
                    )}
                    {classItem.type === 'live' && (
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        <Video className="h-3 w-3 mr-1" />
                        Live
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-1">
                    {classItem.course} • {classItem.instructor}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(classItem.date)}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {classItem.time} ({classItem.duration}min)
                    </div>
                    
                    {classItem.type === 'live' && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {classItem.attendees}/{classItem.maxAttendees}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  <Button 
                    size="sm" 
                    variant={isToday(classItem.date) ? "default" : "outline"}
                  >
                    {classItem.type === 'live' ? 'Join Class' : 'Watch'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
