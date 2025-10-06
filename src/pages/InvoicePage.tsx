
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Loader2, Download, FileText } from 'lucide-react'

export default function InvoicePage() {
  const { invoiceId } = useParams<{ invoiceId: string }>()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [invoice, setInvoice] = useState<any>(null)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        if (!invoiceId) {
          throw new Error('Invoice ID not provided')
        }

        const { data: response, error } = await supabase.functions.invoke(
          'sslcommerz-payment',
          {
            body: {
              action: 'get_invoice',
              data: { invoiceId }
            }
          }
        )

        if (error) {
          throw error
        }

        if (response.error) {
          throw new Error(response.error)
        }

        setInvoice(response.data)

      } catch (error: any) {
        console.error('Invoice fetch error:', error)
        toast({
          title: "Error Loading Invoice",
          description: error.message || "Unable to load invoice details.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoice()
  }, [invoiceId, toast])

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    if (invoice) {
      const { generateInvoicePDF } = await import('@/utils/invoiceGenerator')
      const invoiceData = {
        invoiceNumber: invoice.invoice_number,
        date: new Date(invoice.issued_at).toLocaleDateString(),
        studentName: invoice.enrollments_v2?.name || 'N/A',
        email: invoice.enrollments_v2?.email || 'N/A',
        phone: invoice.enrollments_v2?.phone || 'N/A',
        courseName: invoice.courses?.title || 'N/A',
        amount: invoice.amount,
        transactionId: invoice.payments_v2?.transaction_id || 'N/A',
        paymentMethod: invoice.payments_v2?.payment_method || 'N/A',
        accessCode: invoice.access_code,
        status: invoice.status
      }
      
      const doc = generateInvoicePDF(invoiceData)
      doc.save(`Invoice_${invoice.invoice_number}.pdf`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-gray-600">The requested invoice could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Print/Download Actions */}
        <div className="mb-6 flex justify-end gap-2 print:hidden">
          <Button onClick={handlePrint} variant="outline" size="lg">
            Print Invoice
          </Button>
          <Button onClick={handleDownload} size="lg">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>

        {/* Invoice Content */}
        <Card className="bg-white shadow-2xl border-0 overflow-hidden print:shadow-none">
          <CardContent className="p-0">
            {/* Premium Header with Gradient */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white p-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-lg">SB</span>
                  </div>
                  <div>
                    <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                      Sulphuric Bench
                    </h1>
                    <p className="text-blue-200 text-lg">Premium Digital Learning Platform</p>
                    <p className="text-slate-300 text-sm mt-1">Empowering Education Through Technology</p>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-8 py-6 rounded-xl shadow-xl text-right border border-blue-500">
                  <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
                  <p className="text-xl font-bold text-blue-100">#{invoice.invoice_number}</p>
                  <p className="text-sm text-blue-200 mt-2">
                    Date: {new Date(invoice.issued_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Company Contact Bar */}
            <div className="px-10 py-4 bg-gradient-to-r from-slate-100 to-blue-50 border-b-2 border-blue-100">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center space-x-6 text-slate-700">
                  <span>📧 support@sulphuricbench.com</span>
                  <span>🌐 www.sulphuricbench.com</span>
                  <span>📱 +880-XXXX-XXXXXX</span>
                </div>
                <div className="text-slate-600 font-medium">
                  Invoice ID: {invoice.id}
                </div>
              </div>
            </div>

            <div className="p-10">
              {/* Customer & Status Details with Enhanced Design */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                {/* Customer Details */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-50 to-white p-8 rounded-xl border-2 border-slate-200 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">👤</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Customer Details</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</label>
                        <p className="text-lg font-medium text-slate-900">{invoice.enrollments_v2?.name || 'Unknown User'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                        <p className="text-slate-700">{invoice.enrollments_v2?.email || 'No Email'}</p>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</label>
                        <p className="text-slate-700 font-medium">{invoice.enrollments_v2?.phone || 'No Phone'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {invoice.enrollments_v2?.institution && (
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Institution</label>
                          <p className="text-slate-700">{invoice.enrollments_v2.institution}</p>
                        </div>
                      )}
                      {invoice.enrollments_v2?.batch && (
                        <div>
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Batch</label>
                          <p className="text-slate-700">{invoice.enrollments_v2.batch}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Access Code */}
                <div className="bg-gradient-to-br from-emerald-50 to-white p-8 rounded-xl border-2 border-emerald-200 shadow-sm">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Status</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Payment Status</label>
                      <div className={`mt-2 px-4 py-2 rounded-lg text-center font-bold text-sm ${
                        invoice.status === 'valid' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {invoice.status === 'valid' ? 'PAID ✓' : invoice.status.toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Course Access Code</label>
                      <div className="mt-2 bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 px-4 py-3 rounded-lg text-center">
                        <div className="font-mono text-lg font-bold text-yellow-800 tracking-wider">
                          {invoice.access_code}
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">Use this code to access your course</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Details - Premium Table */}
              <div className="mb-10">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-bold">📚</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Course Details</h3>
                </div>
                <div className="overflow-hidden rounded-xl border-2 border-slate-200 shadow-lg">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                        <th className="px-8 py-5 text-left font-bold uppercase tracking-wide text-sm">Course Description</th>
                        <th className="px-8 py-5 text-center font-bold uppercase tracking-wide text-sm">Duration</th>
                        <th className="px-8 py-5 text-right font-bold uppercase tracking-wide text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white border-b-2 border-slate-100">
                        <td className="px-8 py-8">
                          <div className="text-slate-900 font-bold text-xl mb-2">
                            {invoice.courses?.title || 'Course Title'}
                          </div>
                          <div className="text-slate-600 text-sm mb-1">
                            Premium Course Enrollment
                          </div>
                          <div className="text-xs text-slate-500">
                            Full access to course materials and resources
                          </div>
                        </td>
                        <td className="px-8 py-8 text-center">
                          <div className="text-slate-700 font-medium">
                            {invoice.courses?.duration_hours ? `${invoice.courses.duration_hours} Hours` : 'Lifetime Access'}
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right">
                          <span className="text-3xl font-bold text-slate-900">৳{invoice.amount}</span>
                          <div className="text-sm text-slate-500 mt-1">BDT</div>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-gradient-to-r from-slate-50 to-blue-50">
                        <td colSpan={2} className="px-8 py-6 text-right font-bold text-xl text-slate-900 uppercase tracking-wide">
                          Total Amount:
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-4xl font-bold text-emerald-600">৳{invoice.amount}</span>
                          <div className="text-sm text-emerald-700 font-medium mt-1">BDT (Bangladeshi Taka)</div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Information */}
              {invoice.payments_v2 && (
                <div className="mb-10">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">💳</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Payment Information</h3>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl border-2 border-green-200 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Transaction ID</label>
                        <p className="font-mono text-sm font-medium text-slate-800">{invoice.payments_v2.transaction_id}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Payment Method</label>
                        <p className="uppercase font-medium text-slate-800">{invoice.payments_v2.payment_method}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Status</label>
                        <p className="uppercase font-bold text-green-600">{invoice.payments_v2.payment_status}</p>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Payment Date</label>
                        <p className="font-medium text-slate-800">{new Date(invoice.payments_v2.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Premium Footer */}
              <div className="mt-16 pt-8 border-t-4 border-gradient-to-r from-blue-600 to-blue-700">
                <div className="text-center bg-gradient-to-r from-blue-50 to-slate-50 p-8 rounded-xl border border-blue-200">
                  <div className="mb-4">
                    <h4 className="text-2xl font-bold text-blue-600 mb-2">
                      🎓 Thank you for learning with Sulphuric Bench!
                    </h4>
                    <p className="text-lg text-slate-700 font-medium">
                      Your journey to excellence starts here
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <span>📧</span>
                      <span>support@sulphuricbench.com</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>🌐</span>
                      <span>www.sulphuricbench.com</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <span>📱</span>
                      <span>+880-XXXX-XXXXXX</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500 space-y-1 border-t border-slate-200 pt-4">
                    <p className="font-medium">This is a computer-generated invoice and does not require a signature.</p>
                    <p>Invoice generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
                    <p className="italic">Sulphuric Bench - Transforming Education Through Innovation</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
