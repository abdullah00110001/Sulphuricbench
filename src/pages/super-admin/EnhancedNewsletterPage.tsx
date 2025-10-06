
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
  Trash2,
  TrendingUp
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'

export default function EnhancedNewsletterPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: subscribers = [], isLoading: loadingSubscribers } = useQuery({
    queryKey: ['enhanced-newsletter-subscribers'],
    queryFn: async () => {
      // Get subscribers from subscriptions table
      const { data: subscriptions, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false })
      
      if (error) throw error
      
      return subscriptions || []
    }
  })

  const { data: totalUsers = 0 } = useQuery({
    queryKey: ['total-platform-users'],
    queryFn: async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      return count || 0
    }
  })

  const { data: recentNewsletters = [] } = useQuery({
    queryKey: ['recent-newsletters'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      return data || []
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
      queryClient.invalidateQueries({ queryKey: ['enhanced-newsletter-subscribers'] })
      queryClient.invalidateQueries({ queryKey: ['recent-newsletters'] })
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

  const conversionRate = totalUsers > 0 ? Math.round((subscribers.length / totalUsers) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            Newsletter Management
          </h1>
          <p className="text-muted-foreground">Manage subscribers and send newsletters with real data</p>
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

      {/* Real Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold text-brand-primary">{subscribers.length}</p>
                <p className="text-xs text-muted-foreground">Real subscriber count</p>
              </div>
              <Mail className="h-8 w-8 text-brand-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-brand-primary">{totalUsers}</p>
                <p className="text-xs text-muted-foreground">Platform registered users</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-brand-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-brand-primary">{conversionRate}%</p>
                <p className="text-xs text-muted-foreground">Users to subscribers</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Newsletters */}
      <Card className="border-brand-primary/20">
        <CardHeader>
          <CardTitle>Recent Newsletters</CardTitle>
          <CardDescription>
            Latest sent newsletters
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentNewsletters.length === 0 ? (
            <div className="text-center py-8">
              <Send className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Newsletters Sent</h3>
              <p className="text-gray-600">
                You haven't sent any newsletters yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentNewsletters.map((newsletter) => (
                <div key={newsletter.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold">{newsletter.subject}</h4>
                    <p className="text-sm text-muted-foreground">
                      Sent {newsletter.sent_at ? formatDistanceToNow(new Date(newsletter.sent_at), { addSuffix: true }) : 'Draft'} • 
                      {newsletter.recipient_count} recipients
                    </p>
                  </div>
                  <Badge className={newsletter.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                    {newsletter.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card className="border-brand-primary/20">
        <CardHeader>
          <CardTitle>Newsletter Subscribers ({subscribers.length})</CardTitle>
          <CardDescription>
            Real subscriber data from database
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
                  <TableHead>#</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((subscriber, index) => (
                  <TableRow key={subscriber.id}>
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
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
