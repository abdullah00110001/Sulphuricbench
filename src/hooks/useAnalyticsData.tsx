
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

type TimeFilter = '24h' | '7d' | '30d' | '6m' | 'all'

export function useAnalyticsData(timeFilter: TimeFilter) {
  return useQuery({
    queryKey: ['analytics-data', timeFilter],
    queryFn: async () => {
      console.log('Fetching analytics data for timeFilter:', timeFilter)
      
      // Calculate date range based on filter
      let dateFilter = new Date()
      switch (timeFilter) {
        case '24h':
          dateFilter.setDate(dateFilter.getDate() - 1)
          break
        case '7d':
          dateFilter.setDate(dateFilter.getDate() - 7)
          break
        case '30d':
          dateFilter.setDate(dateFilter.getDate() - 30)
          break
        case '6m':
          dateFilter.setMonth(dateFilter.getMonth() - 6)
          break
        case 'all':
          dateFilter = new Date('2020-01-01')
          break
      }

      console.log('Date filter:', dateFilter.toISOString())

      // Get all data in parallel
      const [
        usersResponse,
        allUsersResponse,
        coursesResponse,
        enrollmentsResponse,
        enrollmentsV2Response,
        paymentsResponse,
        paymentsV2Response,
        subscriptionsResponse
      ] = await Promise.all([
        supabase.from('profiles').select('*').gte('created_at', dateFilter.toISOString()),
        supabase.from('profiles').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('enrollments').select('*').gte('enrolled_at', dateFilter.toISOString()),
        supabase.from('enrollments_v2').select('*').gte('created_at', dateFilter.toISOString()),
        supabase.from('payments').select('*').gte('created_at', dateFilter.toISOString()),
        supabase.from('payments_v2').select('*').gte('created_at', dateFilter.toISOString()),
        supabase.from('subscriptions').select('*')
      ])

      const users = usersResponse.data || []
      const allUsers = allUsersResponse.data || []
      const courses = coursesResponse.data || []
      const enrollments = enrollmentsResponse.data || []
      const enrollmentsV2 = enrollmentsV2Response.data || []
      const payments = paymentsResponse.data || []
      const paymentsV2 = paymentsV2Response.data || []
      const subscriptions = subscriptionsResponse.data || []

      console.log('Data fetched:', {
        users: users.length,
        allUsers: allUsers.length,
        courses: courses.length,
        enrollments: enrollments.length,
        enrollmentsV2: enrollmentsV2.length,
        payments: payments.length,
        paymentsV2: paymentsV2.length,
        subscriptions: subscriptions.length
      })

      // Calculate totals
      const students = allUsers.filter(u => u.role === 'student')
      const teachers = allUsers.filter(u => u.role === 'teacher' && u.approval_status === 'approved')
      const totalEnrollments = enrollments.length + enrollmentsV2.length
      
      // Calculate revenue
      const revenue1 = payments
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      
      const revenue2 = paymentsV2
        .filter(p => p.payment_status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      
      const totalRevenue = revenue1 + revenue2

      // Generate user signup data for the selected period
      const daysInPeriod = timeFilter === '24h' ? 1 : 
                          timeFilter === '7d' ? 7 :
                          timeFilter === '30d' ? 30 :
                          timeFilter === '6m' ? 180 : 365

      const userSignupData = Array.from({ length: Math.min(daysInPeriod, 30) }, (_, i) => {
        const date = new Date(dateFilter)
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

      // User role distribution
      const roleDistribution = [
        { name: 'Students', value: students.length, color: '#00CFFF' },
        { name: 'Teachers', value: teachers.length, color: '#00B8E6' },
        { name: 'Pending Teachers', value: allUsers.filter(u => u.role === 'teacher' && u.approval_status === 'pending').length, color: '#10B981' }
      ].filter(item => item.value > 0)

      const result = {
        totalUsers: allUsers.length,
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalCourses: courses.filter(c => c.is_published).length,
        totalEnrollments,
        totalRevenue,
        totalSubscribers: subscriptions.filter(s => s.is_active).length,
        userSignupData,
        roleDistribution,
        activeSubscribers: subscriptions.filter(s => s.is_active).length
      }

      console.log('Analytics result:', result)
      return result
    },
    staleTime: 0, // Always refetch to get fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true
  })
}
