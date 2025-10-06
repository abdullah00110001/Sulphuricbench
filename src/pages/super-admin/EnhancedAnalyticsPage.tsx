
import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BarChart3 } from 'lucide-react'
import { useAnalyticsData } from '@/hooks/useAnalyticsData'
import { AnalyticsStats } from '@/components/super-admin/AnalyticsStats'
import { UserSignupChart } from '@/components/super-admin/UserSignupChart'
import { RoleDistributionChart } from '@/components/super-admin/RoleDistributionChart'

type TimeFilter = '24h' | '7d' | '30d' | '6m' | 'all'

export default function EnhancedAnalyticsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d')
  const { data: analytics, isLoading, error, refetch } = useAnalyticsData(timeFilter)

  const timeFilterOptions = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '6m', label: '6 Months' },
    { value: 'all', label: 'All Time' }
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">Unable to fetch analytics data: {error.message}</p>
        <button 
          onClick={() => refetch()} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-gray-600">Unable to load analytics data.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header with Time Filter */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Real-Time Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">Live platform insights and statistics</p>
        </div>
        
        <Select value={timeFilter} onValueChange={(value: TimeFilter) => setTimeFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            {timeFilterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <AnalyticsStats data={analytics} />

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <UserSignupChart data={analytics.userSignupData} timeFilter={timeFilter} />
        <RoleDistributionChart data={analytics.roleDistribution} />
      </div>

      {/* Debug Information */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <pre className="text-sm">
          {JSON.stringify({
            timeFilter,
            totalStudents: analytics.totalStudents,
            totalTeachers: analytics.totalTeachers,
            totalEnrollments: analytics.totalEnrollments,
            signupDataLength: analytics.userSignupData.length,
            lastRefresh: new Date().toISOString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}
