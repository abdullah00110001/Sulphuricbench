
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { 
  Award, 
  Download, 
  Trash2, 
  Plus, 
  Search, 
  Eye,
  FileText,
  Calendar,
  User
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

export function CertificatePanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['certificates', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('certificates')
        .select(`
          *,
          profiles:user_id(full_name, email, avatar_url),
          courses:course_id(title, instructor_id)
        `)
        .order('issued_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`profiles.full_name.ilike.%${searchTerm}%,courses.title.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    }
  })

  const { data: students = [] } = useQuery({
    queryKey: ['students-for-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .eq('approval_status', 'approved')
        .order('full_name')

      if (error) throw error
      return data || []
    }
  })

  const { data: courses = [] } = useQuery({
    queryKey: ['courses-for-certificates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, instructor_id')
        .eq('is_published', true)
        .order('title')

      if (error) throw error
      return data || []
    }
  })

  const issueCertificateMutation = useMutation({
    mutationFn: async ({ studentId, courseId }: { studentId: string, courseId: string }) => {
      // Check if certificate already exists
      const { data: existing } = await supabase
        .from('certificates')
        .select('id')
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .single()

      if (existing) {
        throw new Error('Certificate already exists for this student and course')
      }

      // Issue new certificate
      const { data, error } = await supabase
        .from('certificates')
        .insert({
          user_id: studentId,
          course_id: courseId,
          certificate_url: `https://certificates.example.com/${studentId}-${courseId}.pdf`
        })
        .select()
        .single()

      if (error) throw error

      // Certificate issued successfully

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
      setShowIssueModal(false)
      setSelectedStudent('')
      setSelectedCourse('')
      toast({ title: 'Certificate issued successfully' })
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error issuing certificate',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const revokeCertificateMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] })
      toast({ title: 'Certificate revoked successfully' })
    }
  })

  const downloadCertificate = (certificateUrl: string, studentName: string, courseTitle: string) => {
    // In a real implementation, this would generate and download a PDF
    const link = document.createElement('a')
    link.href = certificateUrl || '#'
    link.download = `certificate-${studentName}-${courseTitle}.pdf`
    link.click()
    
    toast({ title: 'Certificate download started' })
  }

  const exportToCSV = () => {
    const csvContent = [
      ['Student Name', 'Course Title', 'Issued Date', 'Status'],
      ...certificates.map(cert => [
        cert.profiles?.full_name || 'Unknown',
        cert.courses?.title || 'Unknown Course',
        new Date(cert.issued_at).toLocaleDateString(),
        'Active'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'certificates-export.csv'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading certificates...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certificate Management</h2>
          <p className="text-muted-foreground">Issue, view, and manage certificates</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          
          <Dialog open={showIssueModal} onOpenChange={setShowIssueModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Issue Certificate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Issue New Certificate</DialogTitle>
                <DialogDescription>
                  Manually issue a certificate to a student for course completion
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student">Student</Label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.full_name} ({student.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      if (selectedStudent && selectedCourse) {
                        issueCertificateMutation.mutate({
                          studentId: selectedStudent,
                          courseId: selectedCourse
                        })
                      }
                    }}
                    disabled={!selectedStudent || !selectedCourse || issueCertificateMutation.isPending}
                    className="flex-1"
                  >
                    Issue Certificate
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowIssueModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issued</p>
                <p className="text-2xl font-bold">{certificates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {certificates.filter(cert => {
                    const issued = new Date(cert.issued_at)
                    const now = new Date()
                    return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Students</p>
                <p className="text-2xl font-bold">
                  {new Set(certificates.map(cert => cert.user_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unique Courses</p>
                <p className="text-2xl font-bold">
                  {new Set(certificates.map(cert => cert.course_id)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates</CardTitle>
          <CardDescription>
            {certificates.length} certificates found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Issued Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certificates.map((certificate) => (
                <TableRow key={certificate.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{certificate.profiles?.full_name}</p>
                      <p className="text-sm text-gray-500">{certificate.profiles?.email}</p>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <p className="font-medium">{certificate.courses?.title}</p>
                  </TableCell>
                  
                  <TableCell>
                    <span className="text-sm">
                      {formatDistanceToNow(new Date(certificate.issued_at), { addSuffix: true })}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadCertificate(
                          certificate.certificate_url,
                          certificate.profiles?.full_name || 'Unknown',
                          certificate.courses?.title || 'Unknown Course'
                        )}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => revokeCertificateMutation.mutate(certificate.id)}
                        disabled={revokeCertificateMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {certificates.length === 0 && (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certificates Found</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'No certificates match your search criteria.'
                  : 'No certificates have been issued yet.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
