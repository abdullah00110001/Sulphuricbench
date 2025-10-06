
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, Target, Clock, Award } from 'lucide-react'

const weeklyProgressData = [
  { day: 'Mon', hours: 2.5, completed: 3 },
  { day: 'Tue', hours: 3.2, completed: 2 },
  { day: 'Wed', hours: 1.8, completed: 4 },
  { day: 'Thu', hours: 4.1, completed: 1 },
  { day: 'Fri', hours: 2.9, completed: 5 },
  { day: 'Sat', hours: 5.2, completed: 3 },
  { day: 'Sun', hours: 3.8, completed: 2 }
]

const courseProgressData = [
  { name: 'React Fundamentals', progress: 85, color: '#3b82f6' },
  { name: 'Node.js Backend', progress: 62, color: '#10b981' },
  { name: 'Database Design', progress: 94, color: '#f59e0b' },
  { name: 'UI/UX Design', progress: 38, color: '#ef4444' }
]

const skillsData = [
  { name: 'Frontend', value: 75, color: '#3b82f6' },
  { name: 'Backend', value: 60, color: '#10b981' },
  { name: 'Database', value: 85, color: '#f59e0b' },
  { name: 'Design', value: 45, color: '#ef4444' }
]

export function LearningAnalytics() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {/* Weekly Study Hours */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Study Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgressData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `${label}`}
                formatter={(value, name) => [
                  name === 'hours' ? `${value} hours` : `${value} lessons`,
                  name === 'hours' ? 'Study Time' : 'Completed Lessons'
                ]}
              />
              <Bar dataKey="hours" fill="#3b82f6" name="hours" />
              <Bar dataKey="completed" fill="#10b981" name="completed" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Skills Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Skills Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={skillsData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                dataKey="value"
              >
                {skillsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Progress']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {skillsData.map((skill) => (
              <div key={skill.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skill.color }} />
                  <span>{skill.name}</span>
                </div>
                <span className="font-medium">{skill.value}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Course Progress */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Course Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseProgressData.map((course) => (
              <div key={course.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{course.name}</span>
                  <span className="text-muted-foreground">{course.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${course.progress}%`,
                      backgroundColor: course.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
