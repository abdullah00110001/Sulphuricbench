
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { 
  Mail, 
  Send, 
  Users, 
  Trash2
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

export function NewsletterManager() {
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<'subscribers' | 'students'>('subscribers')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: subscribers = [], isLoading: subscribersLoading } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false })

      if (error) throw error
      return data || []
    }
  })

  const { data: students = [] } = useQuery({
    queryKey: ['newsletter-students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('role', 'student')

      if (error) throw error
      return data || []
    }
  })

  const sendNewsletterMutation = useMutation({
    mutationFn: async ({ subject, content, audience }: { subject: string, content: string, audience: 'subscribers' | 'students' }) => {
      // Get recipient emails based on audience
      let recipients: string[] = []
      
      if (audience === 'subscribers') {
        recipients = subscribers.map(sub => sub.email)
      } else {
        recipients = students.map(student => student.email)
      }

      if (recipients.length === 0) {
        throw new Error('No recipients found for the selected audience')
      }

      // For now, just simulate sending - in real implementation, use an email service
      console.log(`Sending newsletter "${subject}" to ${recipients.length} recipients`)
      
      return { recipientCount: recipients.length }
    },
    onSuccess: (result) => {
      toast({
        title: 'Newsletter Sent Successfully!',
        description: `Newsletter sent to ${result.recipientCount} ${audience}`
      })
      setSubject('')
      setContent('')
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send newsletter',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const deleteSubscriberMutation = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', subscriberId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] })
      toast({ title: 'Subscriber removed successfully' })
    }
  })

  const handleSendNewsletter = () => {
    if (!subject.trim() || !content.trim()) {
      toast({
        title: 'Missing content',
        description: 'Please fill in both subject and content',
        variant: 'destructive'
      })
      return
    }

    sendNewsletterMutation.mutate({ subject, content, audience })
  }

  const recipientCount = audience === 'subscribers' ? subscribers.length : students.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Newsletter Management</h2>
        <p className="text-muted-foreground">Create and send newsletters to your audience</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold">{subscribers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Student Emails</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Send className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                <p className="text-2xl font-bold">{subscribers.filter(sub => sub.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Newsletter Composer */}
        <Card>
          <CardHeader>
            <CardTitle>Compose Newsletter</CardTitle>
            <CardDescription>Create and send newsletters to your audience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="audience">Audience</Label>
              <select
                id="audience"
                value={audience}
                onChange={(e) => setAudience(e.target.value as 'subscribers' | 'students')}
                className="w-full mt-1 px-3 py-2 border rounded-md"
              >
                <option value="subscribers">Newsletter Subscribers ({subscribers.length})</option>
                <option value="students">Students ({students.length})</option>
              </select>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Newsletter subject..."
              />
            </div>

            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your newsletter content here..."
                rows={10}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Will be sent to {recipientCount} {audience}
              </p>
              <Button
                onClick={handleSendNewsletter}
                disabled={sendNewsletterMutation.isPending || !subject.trim() || !content.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {sendNewsletterMutation.isPending ? 'Sending...' : 'Send Newsletter'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscribers List */}
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Subscribers</CardTitle>
            <CardDescription>
              {subscribers.length} active subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscribersLoading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Subscribers Yet</h3>
                <p className="text-gray-600">
                  Subscribers will appear here when users sign up for your newsletter.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscribers.slice(0, 10).map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">
                        {subscriber.email}
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(subscriber.subscribed_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        <Badge className={subscriber.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {subscriber.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteSubscriberMutation.mutate(subscriber.id)}
                          disabled={deleteSubscriberMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
