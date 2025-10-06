
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Award, TrendingUp, Clock, Download, DollarSign, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"

export function DashboardOverview() {
  const { user } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null

      console.log('Fetching dashboard stats for user:', user.id)

      // Get enrollments from both tables
      const [enrollmentsResult, enrollmentsV2Result] = await Promise.all([
        supabase
          .from('enrollments')
          .select(`
            *,
            courses(title, price, thumbnail_url)
          `)
          .eq('student_id', user.id),
        
        supabase
          .from('enrollments_v2')
          .select(`
            *,
            courses(title, price, thumbnail_url)
          `)
          .eq('user_id', user.id)
      ])

      if (enrollmentsResult.error) {
        console.error('Error fetching enrollments:', enrollmentsResult.error)
      }
      if (enrollmentsV2Result.error) {
        console.error('Error fetching enrollments v2:', enrollmentsV2Result.error)
      }

      // Combine enrollments
      const allEnrollments = [
        ...(enrollmentsResult.data || []),
        ...(enrollmentsV2Result.data || [])
      ]

      // Get payments from all tables
      const [paymentsResult, manualPaymentsResult, paymentsV2Result] = await Promise.all([
        supabase
          .from('payments')
          .select('amount, payment_status, created_at')
          .eq('user_id', user.id),
        
        supabase
          .from('manual_payments')
          .select('amount, status, created_at')
          .eq('user_id', user.id),
        
        supabase
          .from('payments_v2')
          .select('amount, payment_status, created_at')
          .eq('user_id', user.id)
      ])

      if (paymentsResult.error) {
        console.error('Error fetching payments:', paymentsResult.error)
      }
      if (manualPaymentsResult.error) {
        console.error('Error fetching manual payments:', manualPaymentsResult.error)
      }
      if (paymentsV2Result.error) {
        console.error('Error fetching payments v2:', paymentsV2Result.error)
      }

      // Combine all payments with normalized status
      const allPayments = [
        ...(paymentsResult.data || []).map(p => ({ 
          amount: p.amount, 
          payment_status: p.payment_status, 
          created_at: p.created_at 
        })),
        ...(manualPaymentsResult.data || []).map(p => ({ 
          amount: p.amount, 
          payment_status: p.status, 
          created_at: p.created_at 
        })),
        ...(paymentsV2Result.data || []).map(p => ({ 
          amount: p.amount, 
          payment_status: p.payment_status, 
          created_at: p.created_at 
        }))
      ]

      // Get certificates
      const { data: certificates, error: certificatesError } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', user.id)

      if (certificatesError) {
        console.error('Error fetching certificates:', certificatesError)
      }

      const totalEnrolled = allEnrollments?.length || 0
      const completedCourses = allEnrollments?.filter(e => (e as any).progress_percentage === 100).length || 0
      const inProgressCourses = allEnrollments?.filter(e => (e as any).progress_percentage > 0 && (e as any).progress_percentage < 100).length || 0
      const totalProgress = allEnrollments?.reduce((acc, e) => acc + ((e as any).progress_percentage || 0), 0) || 0
      const avgProgress = totalEnrolled > 0 ? Math.round(totalProgress / totalEnrolled) : 0
      
      const completedPayments = allPayments?.filter(p => p.payment_status === 'completed' || p.payment_status === 'approved') || []
      const totalSpent = completedPayments.reduce((acc, p) => acc + Number(p.amount), 0) || 0
      const pendingPayments = allPayments?.filter(p => p.payment_status === 'pending').length || 0

      return {
        totalEnrolled,
        completedCourses,
        inProgressCourses,
        avgProgress,
        totalCertificates: certificates?.length || 0,
        totalSpent,
        pendingPayments,
        recentEnrollments: allEnrollments?.slice(0, 3) || []
      }
    },
    enabled: !!user?.id
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Loading your learning progress...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded mb-2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const statsCards = [
    {
      title: "Total Investment",
      value: `৳${stats?.totalSpent || 0}`,
      subtitle: "Amount spent on courses",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950"
    },
    {
      title: "Pending Payments",
      value: stats?.pendingPayments || 0,
      subtitle: "Awaiting completion",
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-muted-foreground">Track your learning progress and achievements</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Enrollments */}
      {stats?.recentEnrollments && stats.recentEnrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentEnrollments.map((enrollment: any) => (
                <div key={enrollment.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={enrollment.courses?.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop"}
                      alt={enrollment.courses?.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{enrollment.courses?.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant={enrollment.progress_percentage === 100 ? "default" : "secondary"}>
                    {enrollment.progress_percentage || 0}% Complete
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
              onClick={() => window.location.href = '/'}
            >
              <BookOpen className="h-6 w-6 mb-2" />
              <span className="text-sm">Browse Courses</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
              onClick={() => {
                // Create and download a sample invoice
                const link = document.createElement('a')
                link.href = '#'
                link.click()
              }}
            >
              <Download className="h-6 w-6 mb-2" />
              <span className="text-sm">Download Materials</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
              onClick={() => alert('Certificates feature coming soon!')}
            >
              <Award className="h-6 w-6 mb-2" />
              <span className="text-sm">View Certificates</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-auto flex-col py-4"
              onClick={() => alert('Progress report feature coming soon!')}
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Progress Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
