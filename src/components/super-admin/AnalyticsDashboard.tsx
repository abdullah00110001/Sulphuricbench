
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  Award,
  Calendar,
  DollarSign,
  Eye,
  MessageSquare
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export function AnalyticsDashboard() {
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      // Get real data from database
      const { data: students } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student')

      const { data: teachers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'teacher')
        .eq('approval_status', 'approved')

      const { data: pendingTeachers } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'teacher')
        .eq('approval_status', 'pending')

      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('is_published', true)

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('payment_status', 'completed')

      const totalRevenue = paymentsData?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0

      const { data: visitsData } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', new Date().toISOString().split('T')[0])

      return {
        students: students?.length || 0,
        teachers: teachers?.length || 0,
        pendingTeachers: pendingTeachers?.length || 0,
        courses: courses?.length || 0,
        revenue: totalRevenue,
        visits: visitsData?.length || 0
      }
    }
  })

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_leaderboard', { limit_count: 10 })
      if (error) throw error
      return data || []
    }
  })

  const { data: courseEnrollments } = useQuery({
    queryKey: ['course-enrollments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          enrollments(id)
        `)
        .eq('is_published', true)
        .limit(5)

      return data?.map(course => ({
        name: course.title,
        enrollments: course.enrollments?.length || 0
      })) || []
    }
  })

  // Mock data for daily signups (replace with real data if you have daily tracking)
  const dailySignupsData = [
    { name: 'Mon', signups: 0 },
    { name: 'Tue', signups: 0 },
    { name: 'Wed', signups: 0 },
    { name: 'Thu', signups: 0 },
    { name: 'Fri', signups: 0 },
    { name: 'Sat', signups: 0 },
    { name: 'Sun', signups: analytics?.visits || 0 },
  ]

  const userRoleData = [
    { name: 'Students', value: analytics?.students || 0, color: '#0088FE' },
    { name: 'Teachers', value: analytics?.teachers || 0, color: '#00C49F' },
    { name: 'Pending Teachers', value: analytics?.pendingTeachers || 0, color: '#FFBB28' },
  ]

  const statsCards = [
    {
      title: 'Total Students',
      value: analytics?.students || 0,
      icon: Users,
      description: 'Active student accounts',
      color: 'text-blue-600',
      change: 'Real-time data'
    },
    {
      title: 'Approved Teachers',
      value: analytics?.teachers || 0,
      icon: GraduationCap,
      description: 'Verified instructors',
      color: 'text-green-600',
      change: 'Real-time data'
    },
    {
      title: 'Pending Approvals',
      value: analytics?.pendingTeachers || 0,
      icon: Award,
      description: 'Teacher applications',
      color: 'text-orange-600',
      change: 'Real-time data'
    },
    {
      title: 'Active Courses',
      value: analytics?.courses || 0,
      icon: BookOpen,
      description: 'Published courses',
      color: 'text-purple-600',
      change: 'Real-time data'
    },
    {
      title: 'Total Revenue',
      value: `৳${analytics?.revenue || 0}`,
      icon: DollarSign,
      description: 'All time',
      color: 'text-emerald-600',
      change: 'Real-time data'
    },
    {
      title: 'New Users Today',
      value: analytics?.visits || 0,
      icon: Eye,
      description: 'Today',
      color: 'text-indigo-600',
      change: 'Real-time data'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <p className="text-muted-foreground">Platform performance and user insights</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <p className="text-xs text-blue-600 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Signups Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Signups</CardTitle>
            <CardDescription>New user registrations this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailySignupsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="signups" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ fill: '#8884d8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Platform user roles breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {userRoleData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Enrollments and Leaderboard */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Popular Courses</CardTitle>
            <CardDescription>Top courses by enrollment</CardDescription>
          </CardHeader>
          <CardContent>
            {courseEnrollments && courseEnrollments.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseEnrollments} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="enrollments" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No course enrollment data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Most active users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboard && leaderboard.length > 0 ? (
                leaderboard.slice(0, 5).map((user: any, index: number) => (
                  <div key={user.user_id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url} />
                      <AvatarFallback>
                        {user.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{user.full_name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{user.points} points</span>
                        <span>•</span>
                        <span>Level {user.level}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        <span className="text-blue-600">{user.total_blogs} blogs</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.completed_courses} courses completed
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No user activity data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
