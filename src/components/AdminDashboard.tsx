import { useState } from 'react'
import { useSuperAdminAuth } from '@/hooks/useSuperAdminAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Trash2, Edit, Plus, LogOut } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  price: number
}

interface Teacher {
  id: string
  name: string
  email: string
  subject: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

export const AdminDashboard = () => {
  const { user, logout } = useSuperAdminAuth()
  
  // Sample data - in real app this would come from API
  const [courses, setCourses] = useState<Course[]>([
    { id: '1', title: 'React Basics', description: 'Learn React fundamentals', price: 99 },
    { id: '2', title: 'Advanced JavaScript', description: 'Master JS concepts', price: 149 }
  ])
  
  const [teachers, setTeachers] = useState<Teacher[]>([
    { id: '1', name: 'John Doe', email: 'john@school.com', subject: 'Mathematics' },
    { id: '2', name: 'Jane Smith', email: 'jane@school.com', subject: 'Science' }
  ])
  
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Student One', email: 'student1@school.com', role: 'student' },
    { id: '2', name: 'Student Two', email: 'student2@school.com', role: 'student' }
  ])

  // Course management
  const [newCourse, setNewCourse] = useState({ title: '', description: '', price: 0 })
  
  const addCourse = () => {
    if (newCourse.title) {
      setCourses([...courses, { ...newCourse, id: Date.now().toString() }])
      setNewCourse({ title: '', description: '', price: 0 })
    }
  }
  
  const deleteCourse = (id: string) => {
    setCourses(courses.filter(course => course.id !== id))
  }

  // Teacher management
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', subject: '' })
  
  const addTeacher = () => {
    if (newTeacher.name && newTeacher.email) {
      setTeachers([...teachers, { ...newTeacher, id: Date.now().toString() }])
      setNewTeacher({ name: '', email: '', subject: '' })
    }
  }
  
  const deleteTeacher = (id: string) => {
    setTeachers(teachers.filter(teacher => teacher.id !== id))
  }

  // User management
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' })
  
  const addUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { ...newUser, id: Date.now().toString() }])
      setNewUser({ name: '', email: '', role: 'student' })
    }
  }
  
  const deleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id))
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Welcome, {user?.email}</span>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">Courses</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Course</CardTitle>
                <CardDescription>Create a new course for students</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="course-title">Title</Label>
                    <Input
                      id="course-title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                      placeholder="Course title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="course-price">Price</Label>
                    <Input
                      id="course-price"
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: Number(e.target.value)})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="course-description">Description</Label>
                  <Textarea
                    id="course-description"
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    placeholder="Course description"
                  />
                </div>
                <Button onClick={addCourse}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Course
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.description}</p>
                        <p className="text-sm font-medium">${course.price}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteCourse(course.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New Teacher</CardTitle>
                <CardDescription>Add a teacher to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="teacher-name">Name</Label>
                    <Input
                      id="teacher-name"
                      value={newTeacher.name}
                      onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                      placeholder="Teacher name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="teacher-email">Email</Label>
                    <Input
                      id="teacher-email"
                      type="email"
                      value={newTeacher.email}
                      onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                      placeholder="teacher@school.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="teacher-subject">Subject</Label>
                  <Input
                    id="teacher-subject"
                    value={newTeacher.subject}
                    onChange={(e) => setNewTeacher({...newTeacher, subject: e.target.value})}
                    placeholder="Subject taught"
                  />
                </div>
                <Button onClick={addTeacher}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teacher
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teachers.map(teacher => (
                    <div key={teacher.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{teacher.name}</h3>
                        <p className="text-sm text-muted-foreground">{teacher.email}</p>
                        <p className="text-sm">{teacher.subject}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteTeacher(teacher.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
                <CardDescription>Add a user to the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="user-name">Name</Label>
                    <Input
                      id="user-name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      placeholder="User name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="user-email">Email</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      placeholder="user@school.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="user-role">Role</Label>
                  <Input
                    id="user-role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    placeholder="student"
                  />
                </div>
                <Button onClick={addUser}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Manage Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h3 className="font-medium">{user.name}</h3>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-sm capitalize">{user.role}</p>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteUser(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}