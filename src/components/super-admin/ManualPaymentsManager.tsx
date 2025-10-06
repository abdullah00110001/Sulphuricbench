
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Check, X, Eye, Download, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { generateInvoiceNumber, downloadInvoice } from '@/utils/invoiceGenerator'

const FN_NAMES = ['manual-actions'] as const

async function callManualEF(body: any) {
  // Try supabase-js invoke across aliases first (auto headers)
  for (const fn of FN_NAMES) {
    try {
      const { data, error } = await supabase.functions.invoke(fn, { body })
      if (error) throw error
      return data
    } catch (e) {
      console.warn('[EF invoke failed]', fn, e)
    }
  }

  // Fallback: direct POST to Edge Function REST endpoint with both headers
  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  } as Record<string, string>

  for (const fn of FN_NAMES) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/${fn}` ,{
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })
      const text = await res.text()
      if (!res.ok) throw new Error(text || `HTTP ${res.status}`)
      try { return JSON.parse(text) } catch { return { raw: text } }
    } catch (e) {
      console.warn('[EF direct failed]', fn, e)
    }
  }

  throw new Error('All Edge Function routes failed. Please whitelist *.supabase.co and retry.')
}

interface ManualPayment {
  id: string
  user_id: string
  course_id: string
  full_name: string
  email?: string
  bkash_number: string
  transaction_id: string
  amount: number
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  courses?: {
    title: string
  }
}

export function ManualPaymentsManager() {
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['manual-payments'],
    queryFn: async () => {
      console.log('Fetching manual payments...')
      
      const superAdminEmail = localStorage.getItem('superAdminEmail')
      if (!superAdminEmail) {
        throw new Error('Super admin email not found')
      }

      const result = await callManualEF({
        action: 'get_pending',
        email: superAdminEmail
      })

      console.log('Edge function successful, found payments:', result?.data?.length || 0)
      return (result?.data || []) as ManualPayment[]
    },
    retry: 2,
    refetchOnWindowFocus: true
  })

  const approveMutation = useMutation({
    mutationFn: async ({ paymentId }: { paymentId: string }) => {
      console.log('Approving payment:', paymentId)
      
      const superAdminEmail = localStorage.getItem('superAdminEmail')
      if (!superAdminEmail) {
        throw new Error('Super admin email not found')
      }

      const result = await callManualEF({
        action: 'update_status',
        email: superAdminEmail,
        paymentId,
        status: 'approved'
      })

      console.log('Payment approved successfully')
      return { paymentId }

      console.log('Payment approved successfully')
      return { paymentId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['manual-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] })
      toast({ 
        title: 'Payment approved successfully',
        description: 'Enrollment has been created for the student'
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to approve payment',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      console.log('Rejecting payment:', paymentId)
      
      const superAdminEmail = localStorage.getItem('superAdminEmail')
      if (!superAdminEmail) {
        throw new Error('Super admin email not found')
      }

      const result = await callManualEF({
        action: 'update_status',
        email: superAdminEmail,
        paymentId,
        status: 'rejected'
      })
      
      console.log('Payment rejected successfully')
      return { paymentId }
      
      console.log('Payment rejected successfully')
      return { paymentId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manual-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-invoices'] })
      toast({ title: 'Payment rejected successfully' })
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to reject payment',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const filteredPayments = payments.filter((payment) =>
    payment.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.bkash_number?.includes(searchTerm)
  )

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading manual payments...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    console.error('Manual payments query error:', error)
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">Error loading manual payments: {error.message}</p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['manual-payments'] })}
              className="mr-2"
            >
              Retry
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Payments (bKash)</CardTitle>
        <CardDescription>
          Review and approve manual payment submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, TRX ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Details</TableHead>
              <TableHead>Transaction Info</TableHead>
              <TableHead>Course</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{payment.full_name}</div>
                    <div className="text-sm text-muted-foreground">{payment.bkash_number}</div>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {payment.transaction_id}
                </TableCell>
                <TableCell>
                  {payment.courses?.title || 'N/A'}
                </TableCell>
                <TableCell>৳{payment.amount}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadge(payment.status)}>
                    {payment.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(payment.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {payment.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate({
                          paymentId: payment.id
                        })}
                        disabled={approveMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-3 w-3" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectMutation.mutate(payment.id)}
                        disabled={rejectMutation.isPending}
                      >
                        <X className="h-3 w-3" />
                        Reject
                      </Button>
                    </div>
                  )}
                  {payment.status === 'approved' && (
                    <div className="text-xs text-green-600">
                      <FileText className="h-3 w-3 inline mr-1" />
                      Invoice Generated
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPayments.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            No manual payments found
          </div>
        )}
      </CardContent>
    </Card>
  )
}
