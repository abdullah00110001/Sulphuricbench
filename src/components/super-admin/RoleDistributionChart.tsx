
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

interface RoleDistributionChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
}

export function RoleDistributionChart({ data }: RoleDistributionChartProps) {
  return (
    <Card className="border-brand-primary/20">
      <CardHeader>
        <CardTitle className="text-brand-primary">User Distribution</CardTitle>
        <CardDescription>Real platform user roles breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
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
  )
}
