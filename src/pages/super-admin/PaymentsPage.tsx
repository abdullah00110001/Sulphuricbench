
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, ExternalLink } from 'lucide-react'

// Define interfaces for the payment data
interface Payment {
  id: string
  user_name: string
  user_email: string
  user_phone: string
  batch?: string
  institution?: string
  transaction_id?: string
  amount: number
  payment_status: string
  created_at: string
  courses?: {
    title: string
    thumbnail_url?: string
  }
  invoice_id?: string | null
  payment_type: 'manual' | 'online'
}

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: async () => {
      // Query both manual payments and regular payments without foreign key joins
      const [manualPaymentsResponse, paymentsResponse, coursesResponse, profilesResponse] = await Promise.all([
        supabase
          .from('manual_payments')
          .select('*')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('payments_v2')
          .select('*')
          .order('created_at', { ascending: false }),
          
        supabase
          .from('courses')
          .select('id, title, thumbnail_url'),
          
        supabase
          .from('profiles')
          .select('id, email, full_name, phone')
      ])

      const manualPayments = manualPaymentsResponse.data || []
      const regularPayments = paymentsResponse.data || []
      const courses = coursesResponse.data || []
      const profiles = profilesResponse.data || []

      // Helper function to find related data
      const findCourse = (courseId: string) => courses.find(c => c.id === courseId)
      const findProfile = (userId: string) => profiles.find(p => p.id === userId)

      // Combine and transform both types of payments
      const allPayments = [
        ...manualPayments.map((payment: any) => {
          const course = findCourse(payment.course_id)
          const profile = findProfile(payment.user_id)
          return {
            id: payment.id,
            user_name: payment.full_name || profile?.full_name || 'Unknown User',
            user_email: profile?.email || 'No Email',
            user_phone: payment.bkash_number || profile?.phone || '',
            transaction_id: payment.transaction_id || 'Manual Payment',
            amount: payment.amount,
            payment_status: payment.status,
            created_at: payment.created_at,
            courses: course ? { title: course.title, thumbnail_url: course.thumbnail_url } : null,
            payment_type: 'manual',
            invoice_id: payment.status === 'approved' ? `SB-${payment.id.slice(0, 8)}` : null
          }
        }),
        ...regularPayments.map((payment: any) => {
          const course = findCourse(payment.course_id)
          const profile = findProfile(payment.user_id)
          return {
            id: payment.id,
            user_name: profile?.full_name || 'Unknown User',
            user_email: profile?.email || 'No Email',
            user_phone: profile?.phone || '',
            transaction_id: payment.transaction_id || payment.val_id,
            amount: payment.amount,
            payment_status: payment.payment_status,
            created_at: payment.created_at,
            courses: course ? { title: course.title, thumbnail_url: course.thumbnail_url } : null,
            payment_type: 'online',
            invoice_id: payment.payment_status === 'completed' ? `SB-${payment.id.slice(0, 8)}` : null
          }
        })
      ]

      // Sort by created_at descending
      return allPayments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) as Payment[]
    }
  })

  const filteredPayments = payments.filter((payment: Payment) =>
    payment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          View all payments and transaction details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
          <CardDescription>
            Monitor all payment transactions and user details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user name, email, transaction ID, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading payments...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Info</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Invoice</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.user_name}</div>
                        <div className="text-sm text-muted-foreground">{payment.user_email}</div>
                        <div className="text-sm text-muted-foreground">{payment.user_phone}</div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          {payment.payment_type === 'manual' ? 'Manual Payment' : 'Online Payment'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {payment.transaction_id || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {payment.courses?.thumbnail_url && (
                          <img 
                            src={payment.courses.thumbnail_url} 
                            alt={payment.courses.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span>{payment.courses?.title || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>৳{payment.amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(payment.payment_status)}>
                        {payment.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {payment.invoice_id ? (
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {payment.invoice_id}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No Invoice</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredPayments.length === 0 && !isLoading && (
            <div className="text-center py-4 text-muted-foreground">
              No payments found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
