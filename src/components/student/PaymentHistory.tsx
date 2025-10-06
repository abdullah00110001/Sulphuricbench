import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { Download, Calendar, CreditCard, DollarSign, CheckCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { InvoiceDownloader } from "./InvoiceDownloader"
import { InvoicesList } from "./InvoicesList"
export function PaymentHistory() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payment-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      console.log('Fetching payment history for user:', user.id)

      // Fetch both regular payments and manual payments
      const [paymentsResult, manualPaymentsResult, paymentsV2Result, invoicesResult] = await Promise.all([
        supabase
          .from('payments')
          .select(`
            *,
            courses(title, thumbnail_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('manual_payments')
          .select(`
            *,
            courses(title, thumbnail_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
 
        supabase
          .from('payments_v2')
          .select(`
            *,
            courses(title, thumbnail_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),

        supabase
          .from('invoices')
          .select(`
            *,
            courses(title, thumbnail_url)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ])

      if (paymentsResult.error) {
        console.error('Error fetching payments:', paymentsResult.error)
        throw paymentsResult.error
      }

      if (manualPaymentsResult.error) {
        console.error('Error fetching manual payments:', manualPaymentsResult.error)
        throw manualPaymentsResult.error
      }

      if (paymentsV2Result.error) {
        console.error('Error fetching payments v2:', paymentsV2Result.error)
        throw paymentsV2Result.error
      }

      if (invoicesResult.error) {
        console.error('Error fetching invoices:', invoicesResult.error)
        throw invoicesResult.error
      }

      // Combine and normalize the results
      const allPayments = [
        ...(paymentsResult.data || []).map((p: any) => ({
          ...p,
          payment_status: p.payment_status,
          payment_method: p.payment_method,
          type: 'regular'
        })),
        ...(manualPaymentsResult.data || []).map((p: any) => ({
          ...p,
          payment_status: p.status,
          payment_method: 'bkash_manual',
          transaction_id: p.transaction_id,
          type: 'manual'
        })),
        ...(paymentsV2Result.data || []).map((p: any) => ({
          ...p,
          payment_status: p.payment_status,
          payment_method: p.payment_method || 'sslcommerz',
          transaction_id: p.transaction_id || p.val_id,
          type: 'online'
        })),
        ...(invoicesResult.data || []).map((inv: any) => ({
          ...inv,
          amount: inv.amount,
          payment_status: inv.status === 'paid' ? 'approved' : inv.status,
          payment_method: inv.payment_id ? 'sslcommerz' : 'bkash_manual',
          transaction_id: inv.payment_id || inv.id,
          type: 'invoice'
        }))
      ]

      return allPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    },
    enabled: !!user?.id
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'default'
      case 'pending':
        return 'secondary'
      case 'failed':
      case 'rejected':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'Success'
      case 'pending':
        return 'Pending'
      case 'failed':
      case 'rejected':
        return 'Failed'
      default:
        return status
    }
  }

  const handleViewInvoice = (payment: any) => {
    // Use existing invoice page route
    navigate(`/invoice/${payment.id}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Payment History</h2>
          <p className="text-muted-foreground">Loading your payment records...</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-48" />
                      <div className="h-3 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const totalSpent = payments?.filter(p => p.payment_status === 'completed' || p.payment_status === 'approved')
    .reduce((acc, p) => acc + Number(p.amount), 0) || 0

  const pendingAmount = payments?.filter(p => p.payment_status === 'pending')
    .reduce((acc, p) => acc + Number(p.amount), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Payment History</h2>
          <p className="text-muted-foreground">
            {payments?.length || 0} transaction{payments?.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export History
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalSpent}</div>
            <p className="text-xs text-muted-foreground">
              Completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{pendingAmount}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      {payments?.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No payment history</h3>
            <p className="text-muted-foreground mb-4">
              You haven't made any payments yet
            </p>
            <Button>Browse Courses</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments?.map((payment: any) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={payment.courses?.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop"}
                      alt={payment.courses?.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="space-y-1">
                      <h3 className="font-semibold">{payment.courses?.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.created_at)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Transaction ID: {payment.transaction_id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Method: {payment.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="text-lg font-bold">৳{payment.amount}</div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(payment.payment_status)}>
                        {getStatusText(payment.payment_status)}
                      </Badge>
                      {(payment.payment_status === 'completed' || payment.payment_status === 'approved') && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {(payment.payment_status === 'completed' || payment.payment_status === 'approved') && (
                      <div className="mt-2">
                        <InvoiceDownloader
                          paymentId={payment.id}
                          courseName={payment.courses?.title || 'Course'}
                          amount={payment.amount}
                          transactionId={payment.transaction_id}
                          paymentMethod={payment.payment_method}
                          studentName={profile?.full_name || user?.email?.split('@')[0] || 'Student'}
                          email={user?.email || ''}
                          phone={profile?.phone || ''}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invoices */}
      <div className="pt-4">
        <InvoicesList />
      </div>
    </div>
  )
}
