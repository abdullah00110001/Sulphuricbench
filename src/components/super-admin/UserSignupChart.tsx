
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface UserSignupChartProps {
  data: Array<{
    date: string
    signups: number
    total: number
  }>
  timeFilter: string
}

export function UserSignupChart({ data, timeFilter }: UserSignupChartProps) {
  const timeFilterOptions = {
    '24h': '24 Hours',
    '7d': '7 Days', 
    '30d': '30 Days',
    '6m': '6 Months',
    'all': 'All Time'
  }

  return (
    <Card className="border-brand-primary/20">
      <CardHeader>
        <CardTitle className="text-brand-primary">
          User Signups ({timeFilterOptions[timeFilter as keyof typeof timeFilterOptions]})
        </CardTitle>
        <CardDescription>Real user registration data from database</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data}>
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
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No signup data available for selected period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
