
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { BarChart3, TrendingUp, Users, DollarSign, BookOpen, GraduationCap, Award, Activity, Calendar, Eye } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'

const COLORS = ['#00CFFF', '#00B8E6', '#10B981', '#F59E0B', '#8B5CF6']

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      // Get real data from database
      const [
        usersResponse,
        coursesResponse,
        enrollmentsResponse,
        enrollmentsV2Response,
        paymentsResponse,
        paymentsV2Response,
        teachersResponse
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('enrollments').select('*'),
        supabase.from('enrollments_v2').select('*'),
        supabase.from('payments').select('*'),
        supabase.from('payments_v2').select('*'),
        supabase.from('teachers').select('*')
      ])

      const users = usersResponse.data || []
      const courses = coursesResponse.data || []
      const enrollments = enrollmentsResponse.data || []
      const enrollmentsV2 = enrollmentsV2Response.data || []
      const payments = paymentsResponse.data || []
      const paymentsV2 = paymentsV2Response.data || []
      const teachers = teachersResponse.data || []

      // Calculate total real enrollments from both tables
      const totalRealEnrollments = enrollments.length + enrollmentsV2.length

      // Calculate revenue from both payment tables
      const revenue1 = payments
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      
      const revenue2 = paymentsV2
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      
      const totalRevenue = revenue1 + revenue2

      // Calculate user growth over time (last 7 days for more accuracy)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const userGrowth = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(sevenDaysAgo)
        date.setDate(date.getDate() + i)
        
        const signupsOnDate = users.filter(user => {
          const userDate = new Date(user.created_at)
          return userDate.toDateString() === date.toDateString()
        }).length

        return {
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          signups: signupsOnDate,
          total: users.filter(user => new Date(user.created_at) <= date).length
        }
      })

      // Course enrollment stats with real data
      const courseStats = courses.map(course => {
        const courseEnrollments = enrollments.filter(e => e.course_id === course.id)
        const courseEnrollmentsV2 = enrollmentsV2.filter(e => e.course_id === course.id)
        const totalEnrollments = courseEnrollments.length + courseEnrollmentsV2.length
        
        return {
          name: course.title.substring(0, 20) + (course.title.length > 20 ? '...' : ''),
          enrollments: totalEnrollments,
          completions: courseEnrollments.filter(e => e.progress_percentage === 100).length,
          revenue: [...payments, ...paymentsV2]
            .filter(p => p.course_id === course.id && p.payment_status === 'completed')
            .reduce((sum, p) => sum + Number(p.amount || 0), 0)
        }
      }).sort((a, b) => b.enrollments - a.enrollments).slice(0, 8)

      // User role distribution with real data
      const students = users.filter(u => u.role === 'student')
      const approvedTeachers = users.filter(u => u.role === 'teacher' && u.approval_status === 'approved')
      const pendingTeachers = users.filter(u => u.role === 'teacher' && u.approval_status === 'pending')
      
      const roleDistribution = [
        { name: 'Students', value: students.length, color: COLORS[0] },
        { name: 'Teachers', value: approvedTeachers.length, color: COLORS[1] },
        { name: 'Pending Teachers', value: pendingTeachers.length, color: COLORS[2] }
      ].filter(item => item.value > 0)

      // Monthly revenue trend (last 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const date = new Date(sixMonthsAgo)
        date.setMonth(date.getMonth() + i)
        
        const monthlyPayments = [...payments, ...paymentsV2].filter(payment => {
          const paymentDate = new Date(payment.created_at)
          return paymentDate.getMonth() === date.getMonth() && 
                 paymentDate.getFullYear() === date.getFullYear() &&
                 payment.payment_status === 'completed'
        })

        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          revenue: monthlyPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0),
          enrollments: monthlyPayments.length
        }
      })

      return {
        totalUsers: users.length,
        totalStudents: students.length,
        totalTeachers: approvedTeachers.length,
        pendingTeachers: pendingTeachers.length,
        totalCourses: courses.filter(c => c.is_published).length,
        totalEnrollments: totalRealEnrollments,
        totalRevenue,
        userGrowth,
        courseStats,
        roleDistribution,
        monthlyRevenue,
        activeTeachers: teachers.filter(t => t.is_active).length,
        completionRate: enrollments.length > 0 ? 
          (enrollments.filter(e => e.progress_percentage === 100).length / enrollments.length * 100) : 0
      }
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600">Unable to fetch analytics data. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Real-time platform insights and statistics</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-brand-primary">{analytics.totalStudents}</p>
                <p className="text-xs text-muted-foreground">+{analytics.totalUsers - analytics.totalStudents} other users</p>
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
                <p className="text-2xl font-bold text-brand-primary">{analytics.totalTeachers}</p>
                <p className="text-xs text-muted-foreground">{analytics.pendingTeachers} pending approval</p>
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
                <p className="text-2xl font-bold text-brand-primary">{analytics.totalCourses}</p>
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
                <p className="text-2xl font-bold text-brand-primary">{analytics.totalEnrollments}</p>
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
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-brand-primary">৳{analytics.totalRevenue?.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">From completed payments</p>
              </div>
              <DollarSign className="h-8 w-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold text-brand-primary">{analytics.completionRate?.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Course completion average</p>
              </div>
              <Award className="h-8 w-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle className="text-brand-primary">User Growth (Last 7 Days)</CardTitle>
            <CardDescription>Daily user registration trends with cumulative total</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.userGrowth.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="signups" 
                    stroke="hsl(var(--brand-primary))" 
                    fill="hsl(var(--brand-primary))" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                    name="New Signups"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(var(--brand-secondary))" 
                    strokeWidth={2}
                    name="Total Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No signup data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle className="text-brand-primary">User Distribution</CardTitle>
            <CardDescription>Platform user roles breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.roleDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No user data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue Trend */}
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle className="text-brand-primary">Revenue Trend (6 Months)</CardTitle>
            <CardDescription>Monthly revenue and enrollment growth</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `৳${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Enrollments'
                    ]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--brand-primary))" 
                    fill="hsl(var(--brand-primary))" 
                    fillOpacity={0.3}
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Performance */}
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle className="text-brand-primary">Top Performing Courses</CardTitle>
            <CardDescription>Courses ranked by enrollment and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.courseStats.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.courseStats} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value, name) => [
                      name === 'revenue' ? `৳${value.toLocaleString()}` : value,
                      name === 'enrollments' ? 'Enrollments' : 'Revenue'
                    ]}
                  />
                  <Bar dataKey="enrollments" fill="hsl(var(--brand-primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No course data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-brand-primary">Engagement Rate</h3>
              <p className="text-3xl font-bold text-brand-primary">
                {analytics.totalEnrollments > 0 && analytics.totalStudents > 0
                  ? Math.round((analytics.totalEnrollments / analytics.totalStudents) * 100)
                  : 0}%
              </p>
              <p className="text-sm text-muted-foreground">Students with enrollments</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-brand-primary">Course Completion</h3>
              <p className="text-3xl font-bold text-brand-primary">
                {analytics.completionRate?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-muted-foreground">Average completion rate</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-brand-primary">Active Teachers</h3>
              <p className="text-3xl font-bold text-brand-primary">
                {analytics.activeTeachers || 0}
              </p>
              <p className="text-sm text-muted-foreground">Currently teaching</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2 text-brand-primary">Avg. Revenue/Course</h3>
              <p className="text-3xl font-bold text-brand-primary">
                ৳{analytics.totalCourses > 0 && analytics.totalRevenue > 0
                  ? Math.round(analytics.totalRevenue / analytics.totalCourses).toLocaleString()
                  : 0}
              </p>
              <p className="text-sm text-muted-foreground">Per published course</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Insights */}
      <Card className="border-brand-primary/20">
        <CardHeader>
          <CardTitle className="text-brand-primary flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Platform Insights
          </CardTitle>
          <CardDescription>Key performance indicators and real-time metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold text-brand-primary">Growth Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Student Growth:</span>
                  <span className="font-medium">
                    {analytics.userGrowth[analytics.userGrowth.length - 1]?.signups || 0} new this week
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Course Catalog:</span>
                  <span className="font-medium">{analytics.totalCourses} active courses</span>
                </div>
                <div className="flex justify-between">
                  <span>Teacher Approval:</span>
                  <span className="font-medium">
                    {analytics.pendingTeachers > 0 ? 
                      `${analytics.pendingTeachers} pending` : 
                      'All approved'
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-brand-primary">Revenue Insights</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="font-medium">৳{analytics.totalRevenue?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>This Month:</span>
                  <span className="font-medium">
                    ৳{analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1]?.revenue?.toLocaleString() || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. per Student:</span>
                  <span className="font-medium">
                    ৳{analytics.totalStudents > 0 ? 
                      Math.round(analytics.totalRevenue / analytics.totalStudents).toLocaleString() : 
                      0
                    }
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-brand-primary">Quality Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Completion Rate:</span>
                  <span className="font-medium">{analytics.completionRate?.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Teachers:</span>
                  <span className="font-medium">{analytics.activeTeachers} of {analytics.totalTeachers}</span>
                </div>
                <div className="flex justify-between">
                  <span>Engagement:</span>
                  <span className="font-medium">
                    {analytics.totalStudents > 0 ? 
                      Math.round((analytics.totalEnrollments / analytics.totalStudents) * 100) : 
                      0
                    }% enrolled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
