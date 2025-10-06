
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Download, Search } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Define interfaces for the invoice data
interface Invoice {
  id: string
  invoice_id: string
  user_name: string
  user_email: string
  user_phone: string
  batch?: string
  institution?: string
  amount: number
  status: string
  created_at: string
  access_code: string
  courses?: {
    title: string
    thumbnail_url?: string
    secret_group_link?: string
  }
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['admin-invoices'],
    queryFn: async () => {
      // Query invoices, courses, and profiles separately
      const [invoicesResponse, coursesResponse, profilesResponse] = await Promise.all([
        supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('courses')
          .select('id, title, thumbnail_url, secret_group_link'),
          
        supabase
          .from('profiles')
          .select('id, email, full_name, phone')
      ])

      if (invoicesResponse.error) {
        console.error('Error fetching invoices:', invoicesResponse.error)
        throw invoicesResponse.error
      }

      const invoicesData = invoicesResponse.data || []
      const courses = coursesResponse.data || []
      const profiles = profilesResponse.data || []

      // Helper functions to find related data
      const findCourse = (courseId: string) => courses.find(c => c.id === courseId)
      const findProfile = (userId: string) => profiles.find(p => p.id === userId)
      
      // Transform invoice data
      return invoicesData.map((invoice: any) => {
        const course = findCourse(invoice.course_id)
        const profile = findProfile(invoice.user_id)
        return {
          id: invoice.id,
          invoice_id: invoice.invoice_number || `SB-${invoice.id.slice(0, 8)}`,
          user_name: profile?.full_name || 'Unknown User',
          user_email: profile?.email || 'No Email',
          user_phone: profile?.phone || '',
          amount: invoice.amount,
          status: invoice.status || 'pending',
          created_at: invoice.created_at,
          access_code: invoice.access_code || `AC-${invoice.id.slice(0, 6)}`,
          courses: course ? { 
            title: course.title, 
            thumbnail_url: course.thumbnail_url,
            secret_group_link: course.secret_group_link 
          } : null
        }
      }) as Invoice[]
    }
  })

  const filteredInvoices = invoices.filter((invoice: Invoice) =>
    invoice.invoice_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.courses?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDownloadInvoice = (invoice: Invoice) => {
    // Create a simple invoice HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoice_id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .invoice-details { margin-bottom: 20px; }
          .table { width: 100%; border-collapse: collapse; }
          .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .table th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INVOICE</h1>
          <h2>Sulphuric Bench</h2>
        </div>
        <div class="invoice-details">
          <p><strong>Invoice ID:</strong> ${invoice.invoice_id}</p>
          <p><strong>Date:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${invoice.status}</p>
        </div>
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> ${invoice.user_name}</p>
        <p><strong>Email:</strong> ${invoice.user_email}</p>
        <p><strong>Phone:</strong> ${invoice.user_phone}</p>
        ${invoice.batch ? `<p><strong>Batch:</strong> ${invoice.batch}</p>` : ''}
        ${invoice.institution ? `<p><strong>Institution:</strong> ${invoice.institution}</p>` : ''}
        
        <h3>Course Details</h3>
        <table class="table">
          <tr>
            <th>Course</th>
            <th>Amount</th>
          </tr>
          <tr>
            <td>${invoice.courses?.title || 'N/A'}</td>
            <td>৳${invoice.amount}</td>
          </tr>
        </table>
        
        <p><strong>Access Code:</strong> ${invoice.access_code}</p>
        ${invoice.courses?.secret_group_link ? `<p><strong>Join Secret Group:</strong> <a href="${invoice.courses.secret_group_link}">${invoice.courses.secret_group_link}</a></p>` : ''}
      </body>
      </html>
    `

    const blob = new Blob([invoiceHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.invoice_id}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: 'Invoice Downloaded',
      description: `Invoice ${invoice.invoice_id} has been downloaded.`
    })
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      valid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', 
      invalid: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
    return statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
        <p className="text-muted-foreground">
          Manage and view all invoices
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>
            View all invoices with detailed information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by invoice ID, user name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {isLoading ? (
            <div className="text-center py-4">Loading invoices...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>User Info</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.invoice_id}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.user_name}</div>
                        <div className="text-sm text-muted-foreground">{invoice.user_email}</div>
                        <div className="text-sm text-muted-foreground">{invoice.user_phone}</div>
                        {invoice.batch && (
                          <div className="text-sm text-muted-foreground">Batch: {invoice.batch}</div>
                        )}
                        {invoice.institution && (
                          <div className="text-sm text-muted-foreground">Institution: {invoice.institution}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {invoice.courses?.thumbnail_url && (
                          <img 
                            src={invoice.courses.thumbnail_url} 
                            alt={invoice.courses.title}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <span>{invoice.courses?.title || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>৳{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(invoice.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice)}
                        >
                          Show
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {filteredInvoices.length === 0 && !isLoading && (
            <div className="text-center py-4 text-muted-foreground">
              No invoices found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
