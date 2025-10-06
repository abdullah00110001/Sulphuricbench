import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { downloadInvoice, generateInvoiceNumber } from "@/utils/invoiceGenerator"

interface InvoiceDownloaderProps {
  paymentId?: string
  courseName: string
  amount: number
  transactionId: string
  paymentMethod: string
  studentName: string
  email: string
  phone: string
  // Optional fields when using stored invoices
  invoiceNumber?: string
  accessCode?: string
  issuedAt?: string
}

export function InvoiceDownloader({
  paymentId,
  courseName,
  amount,
  transactionId,
  paymentMethod,
  studentName,
  email,
  phone,
  invoiceNumber,
  accessCode,
  issuedAt
}: InvoiceDownloaderProps) {
  const { toast } = useToast()

  const handleDownloadInvoice = async () => {
    try {
      // Generate invoice data
      const invoiceData = {
        invoiceNumber: invoiceNumber || generateInvoiceNumber('M'),
        date: issuedAt ? new Date(issuedAt).toLocaleDateString() : new Date().toLocaleDateString(),
        studentName,
        email,
        phone,
        courseName,
        amount,
        transactionId,
        paymentMethod: paymentMethod.toUpperCase(),
        accessCode: accessCode || `AC-${Date.now().toString().slice(-6)}`,
        status: 'PAID'
      }

      // Download the invoice
      downloadInvoice(invoiceData)

      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully."
      })
    } catch (error) {
      console.error('Invoice download error:', error)
      toast({
        title: "Download Failed",
        description: "Unable to download invoice. Please try again.",
        variant: "destructive"
      })
    }
  }

  return (
    <Button 
      size="sm" 
      variant="outline"
      onClick={handleDownloadInvoice}
    >
      <Download className="h-3 w-3 mr-1" />
      Download Invoice
    </Button>
  )
}
