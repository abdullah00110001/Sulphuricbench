import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  CreditCard, 
  Search, 
  Check, 
  X, 
  Eye,
  Calendar
} from 'lucide-react'
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface ManualPayment {
  id: string
  user_id: string
  course_id: string
  full_name: string
  bkash_number: string
  transaction_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  courses?: {
    title: string
  }
}

export default function ManualPaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['manual-payments'],
    queryFn: async () => {
      // Get payments with course info by manually joining
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('manual_payments')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (paymentsError) throw paymentsError
      
      // Get course info for each payment
      const paymentsWithCourses = await Promise.all(
        (paymentsData || []).map(async (payment) => {
          const { data: courseData } = await supabase
            .from('courses')
            .select('title')
            .eq('id', payment.course_id)
            .single()
          
          return {
            ...payment,
            courses: courseData
          }
        })
      )
      
    return paymentsWithCourses as ManualPayment[]
    }
  })

  // Edge Function health checks on mount (verbose logs)
  useEffect(() => {
    const superAdminEmail = (localStorage.getItem('superAdminEmail') || '').trim().toLowerCase()
    console.log('[ManualPayments] Running Edge Function health checks...')

    const fnNames = ['manual-actions']

    // 1) invoke-based health for both routes
    fnNames.forEach((fn) => {
      supabase.functions.invoke(fn, {
        body: { action: 'health', email: superAdminEmail }
      }).then(({ data, error }) => {
        if (error) {
          console.error(`[ManualPayments] invoke:health error (${fn})`, error)
        } else {
          console.log(`[ManualPayments] invoke:health ok (${fn})`, data)
        }
      }).catch((e) => {
        console.error(`[ManualPayments] invoke:health threw (${fn})`, e)
      })
    })

    // 2) direct GET health for both routes
    fnNames.forEach(async (fn) => {
      const url = `${SUPABASE_URL}/functions/v1/${fn}`
      try {
        const res = await fetch(url, {
        method: 'GET',
        headers: { 'apikey': SUPABASE_PUBLISHABLE_KEY, 'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}` }
        })
        const text = await res.text()
        console.log(`[ManualPayments] direct GET health (${fn})`, { status: res.status, text })
      } catch (e) {
        console.error(`[ManualPayments] direct GET health threw (${fn})`, e)
      }
    })
  }, [])

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ paymentId, status }: { paymentId: string; status: 'approve' | 'reject' }) => {
      const superAdminEmail = (localStorage.getItem('superAdminEmail') || '').trim().toLowerCase()
      if (!superAdminEmail) {
        throw new Error('Super admin email not found')
      }

      const fnNames = ['manual-actions'] as const

      // Primary path: try invoke via supabase-js for both routes
      for (const fn of fnNames) {
        try {
          console.log('[ManualPayments] invoke:update_status start', { fn, paymentId, status })
          const { data, error } = await supabase.functions.invoke(fn, {
            body: {
              action: 'update_status',
              email: superAdminEmail,
              paymentId,
              status: status === 'approve' ? 'approved' : 'rejected'
            }
          })
          if (error) throw error
          console.log('[ManualPayments] invoke:update_status ok', { fn, data })
          return data
        } catch (err) {
          console.error('[ManualPayments] invoke:update_status failed', { fn, err })
        }
      }

      // Fallback path: direct fetch to Edge Function URL(s) (extra diagnostics)
      const payload = {
        action: 'update_status',
        email: superAdminEmail,
        paymentId,
        status: status === 'approve' ? 'approved' : 'rejected'
      }

      for (const fn of fnNames) {
        const url = `${SUPABASE_URL}/functions/v1/${fn}`
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              // apikey is required even with verify_jwt=false in some environments
              'apikey': SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify(payload),
          })

          const text = await res.text()
          console.log('[ManualPayments] direct POST response', { fn, status: res.status, text })
          if (!res.ok) {
            throw new Error(`Direct fetch failed: ${res.status} ${text}`)
          }
          try {
            return JSON.parse(text)
          } catch {
            return { raw: text }
          }
        } catch (e) {
          console.error('[ManualPayments] direct POST failed', { fn, error: e })
        }
      }

      throw new Error('All function routes failed. Possible network/ad-block interference. Please whitelist *.supabase.co and try again.')
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['manual-payments'] })
      toast({
        title: `Payment ${status}`,
        description: `Payment has been ${status} successfully.`
      })
      setSelectedPayment(null)
      setActionType(null)
    },
    onError: (error: any) => {
      console.error('Manual payment update failed', {
        message: error?.message,
        name: error?.name,
        cause: error?.cause,
      })
      // Silent health check to help diagnose Edge Function reachability
      const superAdminEmail = (localStorage.getItem('superAdminEmail') || '').trim().toLowerCase()
      if (superAdminEmail) {
        void supabase.functions.invoke('manual-actions', {
          body: { action: 'health', email: superAdminEmail }
        }).then(({ data, error }) => {
          if (error) {
            console.error('Edge Function health check failed:', error)
          } else {
            console.log('Edge Function health check:', data)
          }
        })
      }
      toast({
        title: 'Error',
        description: error?.message || 'Access denied. Super admin access required.',
        variant: 'destructive'
      })
    }
  })

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = !searchTerm || 
      payment.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.bkash_number.includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'approved':
        return <Badge variant="default">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleAction = (payment: ManualPayment, action: 'approve' | 'reject') => {
    setSelectedPayment(payment)
    setActionType(action)
  }

  const confirmAction = () => {
    if (selectedPayment && actionType) {
      updatePaymentMutation.mutate({
        paymentId: selectedPayment.id,
        status: actionType as 'approve' | 'reject'
      })
    }
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading manual payments...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manual Payments</h1>
        <p className="text-muted-foreground">
          Review and manage bKash manual payment submissions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by name, transaction ID, or bKash number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Submissions ({filteredPayments.length})</CardTitle>
          <CardDescription>
            Review bKash manual payment submissions from students
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No payments found</h3>
              <p className="text-muted-foreground">
                No manual payment submissions match your current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>bKash Number</TableHead>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.full_name}
                      </TableCell>
                      <TableCell>
                        {payment.courses?.title || 'Unknown Course'}
                      </TableCell>
                      <TableCell>৳{payment.amount}</TableCell>
                      <TableCell className="font-mono">
                        {payment.bkash_number}
                      </TableCell>
                      <TableCell className="font-mono">
                        {payment.transaction_id}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(payment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(payment.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {payment.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(payment, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAction(payment, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'This will approve the payment and automatically enroll the student in the course. An invoice will be generated.'
                : 'This will reject the payment submission. The student will need to resubmit their payment details.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-2 text-sm">
              <div><strong>Student:</strong> {selectedPayment.full_name}</div>
              <div><strong>Course:</strong> {selectedPayment.courses?.title}</div>
              <div><strong>Amount:</strong> ৳{selectedPayment.amount}</div>
              <div><strong>bKash Number:</strong> {selectedPayment.bkash_number}</div>
              <div><strong>Transaction ID:</strong> {selectedPayment.transaction_id}</div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionType(null)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAction}
              disabled={updatePaymentMutation.isPending}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
            >
              {updatePaymentMutation.isPending 
                ? `${actionType === 'approve' ? 'Approving' : 'Rejecting'}...`
                : `${actionType === 'approve' ? 'Approve' : 'Reject'} Payment`
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}