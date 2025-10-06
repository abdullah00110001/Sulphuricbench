import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, FileText, Search, Upload, Eye, CheckCircle2 } from 'lucide-react'

interface Assignment {
  id: number
  title: string
  course: string
  description: string
  dueDate: string
  dueTime: string
  status: 'Pending' | 'Submitted' | 'Graded' | 'Overdue'
  type: 'Essay' | 'Project' | 'Lab' | 'Quiz' | 'Presentation'
  points: number
  grade?: number
  submittedAt?: string
  feedback?: string
}

// Mock data - in real app this would come from API
const assignments: Assignment[] = [
  {
    id: 1,
    title: 'React Component Refactoring',
    course: 'React Fundamentals',
    description: 'Refactor the provided legacy React components using modern hooks and best practices.',
    dueDate: 'Jan 18, 2024',
    dueTime: '11:59 PM',
    status: 'Pending',
    type: 'Project',
    points: 100
  },
  {
    id: 2,
    title: 'Database Schema Design',
    course: 'Database Design',
    description: 'Design a normalized database schema for an e-commerce application.',
    dueDate: 'Jan 15, 2024',
    dueTime: '5:00 PM',
    status: 'Submitted',
    type: 'Project',
    points: 150,
    submittedAt: 'Jan 14, 2024 at 3:22 PM'
  },
  {
    id: 3,
    title: 'Algorithm Analysis Essay',
    course: 'Computer Science',
    description: 'Write a 2000-word essay analyzing the time complexity of sorting algorithms.',
    dueDate: 'Jan 20, 2024',
    dueTime: '11:59 PM',
    status: 'Graded',
    type: 'Essay',
    points: 80,
    grade: 92,
    submittedAt: 'Jan 19, 2024 at 8:45 PM',
    feedback: 'Excellent analysis and clear explanations. Well done!'
  },
  {
    id: 4,
    title: 'UI/UX Prototype Presentation',
    course: 'UI/UX Design',
    description: 'Present your mobile app prototype with user journey explanations.',
    dueDate: 'Jan 22, 2024',
    dueTime: '2:00 PM',
    status: 'Pending',
    type: 'Presentation',
    points: 120
  },
  {
    id: 5,
    title: 'Node.js API Development',
    course: 'Backend Development',
    description: 'Build a RESTful API with authentication and CRUD operations.',
    dueDate: 'Jan 12, 2024',
    dueTime: '11:59 PM',
    status: 'Overdue',
    type: 'Project',
    points: 200
  }
]

export function StudentLMSAssignments() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus
    const matchesType = filterType === 'all' || assignment.type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: Assignment['status']) => {
    switch (status) {
      case 'Graded':
        return <Badge className="bg-green-100 text-green-800">Graded</Badge>
      case 'Submitted':
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'Overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>
      default:
        return null
    }
  }

  const getTypeColor = (type: Assignment['type']) => {
    switch (type) {
      case 'Essay':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'Project':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'Lab':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'Quiz':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'Presentation':
        return 'text-pink-600 bg-pink-50 border-pink-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-yellow-600 border-yellow-200">
            {assignments.filter(a => a.status === 'Pending').length} Pending
          </Badge>
          <Badge variant="outline" className="text-red-600 border-red-200">
            {assignments.filter(a => a.status === 'Overdue').length} Overdue
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Graded">Graded</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Essay">Essay</SelectItem>
                <SelectItem value="Project">Project</SelectItem>
                <SelectItem value="Lab">Lab</SelectItem>
                <SelectItem value="Quiz">Quiz</SelectItem>
                <SelectItem value="Presentation">Presentation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">{assignment.course}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(assignment.status)}
                      <Badge variant="outline" className={getTypeColor(assignment.type)}>
                        {assignment.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {assignment.description}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {assignment.dueDate} at {assignment.dueTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      <span>{assignment.points} points</span>
                    </div>
                    {assignment.submittedAt && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span>Submitted: {assignment.submittedAt}</span>
                      </div>
                    )}
                  </div>
                  
                  {assignment.grade !== undefined && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Grade: {assignment.grade}/{assignment.points}</span>
                        <span className="text-sm text-green-600 font-medium">
                          {Math.round((assignment.grade / assignment.points) * 100)}%
                        </span>
                      </div>
                      {assignment.feedback && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Feedback:</strong> {assignment.feedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col gap-2 min-w-[120px]">
                  {assignment.status === 'Pending' && (
                    <Button className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Submit
                    </Button>
                  )}
                  {(assignment.status === 'Submitted' || assignment.status === 'Graded') && (
                    <Button variant="outline" className="w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  )}
                  {assignment.status === 'Overdue' && (
                    <Button variant="destructive" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Late Submit
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}