import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Play, Clock, Star, User, Filter } from 'lucide-react'

interface Course {
  id: number
  title: string
  instructor: string
  thumbnail: string
  progress: number
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  category: string
  status: 'Not Started' | 'In Progress' | 'Completed'
  lastAccessed: string
}

// Mock data - in real app this would come from API
const courses: Course[] = [
  {
    id: 1,
    title: 'React Fundamentals',
    instructor: 'Sarah Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    progress: 85,
    duration: '8 hours',
    difficulty: 'Beginner',
    rating: 4.8,
    category: 'Frontend',
    status: 'In Progress',
    lastAccessed: '2 hours ago'
  },
  {
    id: 2,
    title: 'Node.js Backend Development',
    instructor: 'Mike Chen',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=250&fit=crop',
    progress: 60,
    duration: '12 hours',
    difficulty: 'Intermediate',
    rating: 4.9,
    category: 'Backend',
    status: 'In Progress',
    lastAccessed: '1 day ago'
  },
  {
    id: 3,
    title: 'Database Design Principles',
    instructor: 'Emily Davis',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=250&fit=crop',
    progress: 45,
    duration: '6 hours',
    difficulty: 'Beginner',
    rating: 4.7,
    category: 'Database',
    status: 'In Progress',
    lastAccessed: '3 days ago'
  },
  {
    id: 4,
    title: 'UI/UX Design Masterclass',
    instructor: 'Alex Turner',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=400&h=250&fit=crop',
    progress: 100,
    duration: '15 hours',
    difficulty: 'Advanced',
    rating: 4.9,
    category: 'Design',
    status: 'Completed',
    lastAccessed: '1 week ago'
  },
  {
    id: 5,
    title: 'Python for Data Science',
    instructor: 'Dr. Lisa Wang',
    thumbnail: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=250&fit=crop',
    progress: 0,
    duration: '20 hours',
    difficulty: 'Intermediate',
    rating: 4.6,
    category: 'Data Science',
    status: 'Not Started',
    lastAccessed: 'Never'
  },
  {
    id: 6,
    title: 'Mobile App Development',
    instructor: 'James Wilson',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
    progress: 30,
    duration: '18 hours',
    difficulty: 'Advanced',
    rating: 4.8,
    category: 'Mobile',
    status: 'In Progress',
    lastAccessed: '5 days ago'
  }
]

export function StudentLMSCourses() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status: Course['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'In Progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
      case 'Not Started':
        return <Badge variant="outline">Not Started</Badge>
      default:
        return null
    }
  }

  const getDifficultyColor = (difficulty: Course['difficulty']) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'Intermediate':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'Advanced':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button>Browse More Courses</Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses or instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Frontend">Frontend</SelectItem>
                <SelectItem value="Backend">Backend</SelectItem>
                <SelectItem value="Database">Database</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
                <SelectItem value="Mobile">Mobile</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Not Started">Not Started</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button size="sm" className="bg-white/90 text-black hover:bg-white">
                  <Play className="h-4 w-4 mr-2" />
                  {course.status === 'Not Started' ? 'Start' : 'Continue'}
                </Button>
              </div>
              <div className="absolute top-3 left-3">
                {getStatusBadge(course.status)}
              </div>
              <div className="absolute top-3 right-3">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {course.title}
              </h3>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <User className="h-4 w-4" />
                <span>{course.instructor}</span>
              </div>

              <div className="space-y-3">
                {course.progress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{course.rating}</span>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Last accessed: {course.lastAccessed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={() => {
              setSearchTerm('')
              setFilterCategory('all')
              setFilterStatus('all')
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}