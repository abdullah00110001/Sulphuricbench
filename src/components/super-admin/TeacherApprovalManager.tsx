
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, X, Eye, Clock, User, Mail, Phone, FileText, Briefcase, Link } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function TeacherApprovalManager() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['teacher-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

  const { data: registrations = [] } = useQuery({
    queryKey: ['teacher-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_registrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

  const approveMutation = useMutation({
    mutationFn: async ({ id, email, fullName }: { id: string, email: string, fullName: string }) => {
      // Update application status
      const { error: appError } = await supabase
        .from('teacher_applications')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', id)

      if (appError) throw appError

      // Update registration status if exists
      const { error: regError } = await supabase
        .from('teacher_registrations')
        .update({ status: 'approved' })
        .eq('email', email)

      // Create notification
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Teacher Application Approved - Sulphuric Bench',
          template: 'teacher-approval',
          data: {
            name: fullName,
            loginUrl: `${window.location.origin}/`,
            supportEmail: 'support@sulphuricbench.com'
          }
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-applications'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-registrations'] })
      toast({
        title: 'Application Approved',
        description: 'Teacher application has been approved and email sent.'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Approval Failed',
        description: error.message || 'Failed to approve application',
        variant: 'destructive'
      })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, email, fullName }: { id: string, email: string, fullName: string }) => {
      // Update application status
      const { error: appError } = await supabase
        .from('teacher_applications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('id', id)

      if (appError) throw appError

      // Update registration status if exists
      const { error: regError } = await supabase
        .from('teacher_registrations')
        .update({ status: 'rejected' })
        .eq('email', email)

      // Send rejection email
      await supabase.functions.invoke('send-email', {
        body: {
          to: email,
          subject: 'Teacher Application Update - Sulphuric Bench',
          template: 'teacher-rejection',
          data: {
            name: fullName,
            supportEmail: 'support@sulphuricbench.com'
          }
        }
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-applications'] })
      queryClient.invalidateQueries({ queryKey: ['teacher-registrations'] })
      toast({
        title: 'Application Rejected',
        description: 'Teacher application has been rejected and email sent.'
      })
    }
  })

  const parseNotes = (notes: string) => {
    const lines = notes.split('\n')
    const parsed: any = {}
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(': ')
      if (key && valueParts.length > 0) {
        parsed[key.toLowerCase()] = valueParts.join(': ')
      }
    })
    return parsed
  }

  const pendingApplications = applications.filter(app => app.status === 'pending')
  const reviewedApplications = applications.filter(app => app.status !== 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Teacher Applications</h2>
        <p className="text-muted-foreground">Review and manage instructor applications</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="reviewed">
            Reviewed ({reviewedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div>Loading applications...</div>
              </CardContent>
            </Card>
          ) : pendingApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Pending Applications</h3>
                  <p className="text-muted-foreground">
                    All teacher applications have been reviewed
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            pendingApplications.map((application) => {
              const notes = parseNotes(application.notes || '')
              return (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {notes.name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{notes.name || 'Unknown Applicant'}</CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {notes.email}
                            </span>
                            {notes.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {notes.phone}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Qualifications
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {application.qualifications}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          Experience
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {application.experience}
                        </p>
                      </div>
                    </div>

                    {application.portfolio_url && (
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Link className="h-4 w-4" />
                          Portfolio
                        </h4>
                        <a 
                          href={application.portfolio_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {application.portfolio_url}
                        </a>
                      </div>
                    )}

                    {notes.bio && (
                      <div>
                        <h4 className="font-semibold mb-2">Bio</h4>
                        <p className="text-sm text-muted-foreground">{notes.bio}</p>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => approveMutation.mutate({
                          id: application.id,
                          email: notes.email,
                          fullName: notes.name
                        })}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => rejectMutation.mutate({
                          id: application.id,
                          email: notes.email,
                          fullName: notes.name
                        })}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>

        <TabsContent value="reviewed" className="space-y-4">
          {reviewedApplications.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reviewed Applications</h3>
                  <p className="text-muted-foreground">
                    Reviewed applications will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            reviewedApplications.map((application) => {
              const notes = parseNotes(application.notes || '')
              return (
                <Card key={application.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {notes.name?.split(' ').map((n: string) => n[0]).join('') || 'T'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{notes.name || 'Unknown Applicant'}</CardTitle>
                          <CardDescription>{notes.email}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={application.status === 'approved' ? 'default' : 'destructive'}>
                        {application.status === 'approved' ? 'Approved' : 'Rejected'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Reviewed on {new Date(application.reviewed_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
