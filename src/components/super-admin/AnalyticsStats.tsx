
import { Card, CardContent } from '@/components/ui/card'
import { Users, GraduationCap, BookOpen, TrendingUp, Mail } from 'lucide-react'

interface AnalyticsStatsProps {
  data: {
    totalStudents: number
    totalTeachers: number
    totalCourses: number
    totalEnrollments: number
    totalSubscribers: number
  }
}

export function AnalyticsStats({ data }: AnalyticsStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="border-brand-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold text-brand-primary">{data.totalStudents}</p>
              <p className="text-xs text-muted-foreground">Real count from database</p>
            </div>
            <Users className="h-8 w-8 text-brand-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Teachers</p>
              <p className="text-2xl font-bold text-brand-primary">{data.totalTeachers}</p>
              <p className="text-xs text-muted-foreground">Approved teachers</p>
            </div>
            <GraduationCap className="h-8 w-8 text-brand-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Live Courses</p>
              <p className="text-2xl font-bold text-brand-primary">{data.totalCourses}</p>
              <p className="text-xs text-muted-foreground">Published & active</p>
            </div>
            <BookOpen className="h-8 w-8 text-brand-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Enrollments</p>
              <p className="text-2xl font-bold text-brand-primary">{data.totalEnrollments}</p>
              <p className="text-xs text-muted-foreground">Real enrollment count</p>
            </div>
            <TrendingUp className="h-8 w-8 text-brand-primary" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-brand-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Newsletter Subscribers</p>
              <p className="text-2xl font-bold text-brand-primary">{data.totalSubscribers}</p>
              <p className="text-xs text-muted-foreground">Active subscriptions</p>
            </div>
            <Mail className="h-8 w-8 text-brand-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
