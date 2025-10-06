import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

// Mock data - in real app this would come from API
const progressData = [
  { name: 'Week 1', completed: 12, target: 15 },
  { name: 'Week 2', completed: 18, target: 15 },
  { name: 'Week 3', completed: 14, target: 15 },
  { name: 'Week 4', completed: 22, target: 15 },
  { name: 'Week 5', completed: 16, target: 15 },
  { name: 'Week 6', completed: 20, target: 15 },
]

const courseProgressData = [
  { name: 'React Fundamentals', value: 85, color: '#3b82f6' },
  { name: 'Node.js Backend', value: 60, color: '#10b981' },
  { name: 'Database Design', value: 45, color: '#f59e0b' },
  { name: 'UI/UX Design', value: 90, color: '#8b5cf6' },
]

export function ProgressChart() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Learning Progress Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Learning Progress</CardTitle>
          <CardDescription>
            Lessons completed vs weekly target
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={progressData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="name" 
                className="text-xs fill-muted-foreground"
              />
              <YAxis className="text-xs fill-muted-foreground" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Completed"
              />
              <Line 
                type="monotone" 
                dataKey="target" 
                stroke="hsl(var(--muted-foreground))" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Target"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Course Progress Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Course Progress</CardTitle>
          <CardDescription>
            Completion status by course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseProgressData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {courseProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Progress']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {courseProgressData.map((course, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="text-sm text-muted-foreground">{course.name}</span>
                </div>
                <span className="text-sm font-medium">{course.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}