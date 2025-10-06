import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatsCards } from '../components/StatsCards'
import { ProgressChart } from '../components/ProgressChart'
import { ActivityFeed } from '../components/ActivityFeed'
import { UpcomingDeadlines } from '../components/UpcomingDeadlines'
import { BookOpen, TrendingUp, Users, Award } from 'lucide-react'

export function StudentLMSDashboard() {
  const { user, profile } = useAuth()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-4 border-primary-foreground/20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground font-bold text-xl">
                  {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'S'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Student'}! 👋
                </h1>
                <p className="text-primary-foreground/80">
                  Ready to continue your learning journey today?
                </p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold">{profile?.points || 1250}</div>
              <div className="text-sm text-primary-foreground/80">Total Points</div>
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 mt-2">
                Level {profile?.level || 5}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <StatsCards />

      {/* Progress Charts */}
      <ProgressChart />

      {/* Activity and Deadlines */}
      <div className="grid gap-6 md:grid-cols-2">
        <ActivityFeed />
        <UpcomingDeadlines />
      </div>

      {/* Recommended Actions */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recommended for You</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="flex items-center justify-start h-auto p-4">
              <BookOpen className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Continue Course</div>
                <div className="text-sm text-muted-foreground">React Advanced Patterns</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center justify-start h-auto p-4">
              <TrendingUp className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">View Progress</div>
                <div className="text-sm text-muted-foreground">Weekly report available</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center justify-start h-auto p-4">
              <Users className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Join Study Group</div>
                <div className="text-sm text-muted-foreground">3 active discussions</div>
              </div>
            </Button>
            
            <Button variant="outline" className="flex items-center justify-start h-auto p-4">
              <Award className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Earn Certificate</div>
                <div className="text-sm text-muted-foreground">Complete 2 more lessons</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}