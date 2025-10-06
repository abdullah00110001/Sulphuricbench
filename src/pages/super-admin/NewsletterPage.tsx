
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Mail, 
  Plus, 
  Send, 
  Users,
  Calendar,
  Trash2
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

export default function NewsletterPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: subscribers = [], isLoading: loadingSubscribers } = useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      // Get subscribers from subscriptions table
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('email, subscribed_at, is_active')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false })
      
      if (error) throw error
      
      return subscriptions?.map(subscription => ({
        id: subscription.email,
        email: subscription.email,
        is_active: subscription.is_active,
        subscribed_at: subscription.subscribed_at
      })) || []
    }
  })

  const { data: totalUsers = 0 } = useQuery({
    queryKey: ['total-users'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      return count || 0
    }
  })

  const sendNewsletterMutation = useMutation({
    mutationFn: async (newsletterData: any) => {
      // Call the send-newsletter edge function
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: newsletterData.subject,
          content: newsletterData.content,
          recipients: newsletterData.subscribers,
          audience: 'all'
        }
      })
      
      if (error) throw error
      return data
    },
    onSuccess: (result) => {
      toast({ 
        title: 'Newsletter sent successfully!', 
        description: result.message || `Sent to ${subscribers.length} subscribers`
      })
      setIsCreateOpen(false)
      resetForm()
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to send newsletter',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const resetForm = () => {
    setSubject('')
    setContent('')
  }

  const handleSendNewsletter = () => {
    if (!subject.trim() || !content.trim()) {
      toast({ 
        title: 'Error', 
        description: 'Please fill in both subject and content',
        variant: 'destructive'
      })
      return
    }

    sendNewsletterMutation.mutate({
      subject: subject.trim(),
      content: content.trim(),
      subscribers: subscribers.map(s => s.email)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground">Manage subscribers and send newsletters</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Send Newsletter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Send Newsletter</DialogTitle>
              <DialogDescription>
                Send a newsletter to all {subscribers.length} active subscribers
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Subject *
                </label>
                <Input
                  id="subject"
                  placeholder="Enter newsletter subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  Content *
                </label>
                <Textarea
                  id="content"
                  placeholder="Enter newsletter content"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendNewsletter}
                disabled={sendNewsletterMutation.isPending}
              >
                {sendNewsletterMutation.isPending ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send to {subscribers.length} Subscribers
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold">{subscribers.length}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold">
                  {totalUsers > 0 ? Math.round((subscribers.length / totalUsers) * 100) : 0}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter Subscribers ({subscribers.length})</CardTitle>
          <CardDescription>
            Manage your newsletter subscriber list
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSubscribers ? (
            <div className="text-center py-8">Loading subscribers...</div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Subscribers Yet</h3>
              <p className="text-gray-600">
                No one has subscribed to your newsletter yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      {subscriber.email}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(subscriber.subscribed_at), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive">
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
  )
}
