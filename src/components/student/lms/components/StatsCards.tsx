import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Clock, Award, TrendingUp, Target, Activity, Users, Calendar } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  progress?: number
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
}

function StatsCard({ title, value, description, icon: Icon, progress, trend, trendValue }: StatsCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {progress !== undefined && (
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% complete</p>
          </div>
        )}
        {trend && trendValue && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-3 w-3 mr-1 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`} />
            <span className={`text-xs ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`}>
              {trendValue}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  // This would come from API/props in real implementation
  const stats = [
    {
      title: 'Enrolled Courses',
      value: 8,
      description: '3 in progress',
      icon: BookOpen,
      trend: 'up' as const,
      trendValue: '+2 this month'
    },
    {
      title: 'Completed Lessons',
      value: 67,
      description: 'Total lessons',
      icon: Clock,
      progress: 73,
      trend: 'up' as const,
      trendValue: '+12 this week'
    },
    {
      title: 'Upcoming Deadlines',
      value: 5,
      description: 'Next 7 days',
      icon: Calendar,
      trend: 'neutral' as const,
      trendValue: '2 today'
    },
    {
      title: 'Earned Certificates',
      value: 3,
      description: 'Lifetime earned',
      icon: Award,
      trend: 'up' as const,
      trendValue: '+1 this month'
    },
    {
      title: 'Study Streak',
      value: '12 days',
      description: 'Current streak',
      icon: Target,
      trend: 'up' as const,
      trendValue: 'Best: 28 days'
    },
    {
      title: 'Learning Hours',
      value: '24.5h',
      description: 'This month',
      icon: Activity,
      progress: 82,
      trend: 'up' as const,
      trendValue: '+4.2h vs last month'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => (
        <StatsCard key={index} {...stat} />
      ))}
    </div>
  )
}