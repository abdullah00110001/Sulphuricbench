
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, BookOpen, UserCheck, Clock, TrendingUp, Eye } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

export function SuperAdminStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      // Get all user profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('role, created_at, approval_status')

      if (error) {
        throw new Error(error.message)
      }

      // Simple: compute stats directly from profiles (no extra edge function check)
      const totalUsers = profiles?.length || 0
      const students = profiles?.filter(p => p.role === 'student').length || 0
      const teachers = profiles?.filter(p => p.role === 'teacher' && p.approval_status === 'approved').length || 0
      const pendingTeachers = profiles?.filter(p => p.role === 'teacher' && p.approval_status === 'pending').length || 0

      return {
        totalUsers,
        students,
        teachers,
        pendingTeachers,
        totalVisitors: (totalUsers * 5)
      }
    }
  })

  if (isLoading) {
    return <div className="animate-pulse">Loading statistics...</div>
  }

  const statsCards = [
    {
      title: 'Total Visitors',
      value: stats?.totalVisitors || 0,
      icon: Eye,
      description: 'All time visitors',
      color: 'text-pink-600'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Registered users',
      color: 'text-blue-600'
    },
    {
      title: 'Students',
      value: stats?.students || 0,
      icon: BookOpen,
      description: 'Active students',
      color: 'text-green-600'
    },
    {
      title: 'Teachers',
      value: stats?.teachers || 0,
      icon: GraduationCap,
      description: 'Approved teachers',
      color: 'text-purple-600'
    },
    {
      title: 'Pending Applications',
      value: stats?.pendingTeachers || 0,
      icon: Clock,
      description: 'Awaiting approval',
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {statsCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium dark:text-white">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold dark:text-white">{stat.value}</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
