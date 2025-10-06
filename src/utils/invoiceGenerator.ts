import jsPDF from 'jspdf'

export interface InvoiceData {
  invoiceNumber: string
  date: string
  studentName: string
  email: string
  phone: string
  courseName: string
  amount: number
  transactionId: string
  paymentMethod: string
  accessCode: string
  gender?: 'M' | 'F'
  sscYear?: string
  status?: string
}

// Fixed: Enhanced invoice UI with better design
export function generateInvoicePDF(invoiceData: InvoiceData): jsPDF {
  const doc = new jsPDF()
  
  // Premium color palette
  const primaryBlue = { r: 0, g: 207, b: 255 } // Brand color #00CFFF
  const darkBlue = { r: 0, g: 102, b: 204 }
  const darkGray = { r: 15, g: 23, b: 42 }
  const lightGray = { r: 100, g: 116, b: 139 }
  const successGreen = { r: 5, g: 150, b: 105 }
  const white = { r: 255, g: 255, b: 255 }
  
  // Header with modern gradient background
  doc.setFillColor(15, 23, 42)
  doc.rect(0, 0, 210, 55, 'F')
  
  // Add a decorative top accent line
  doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.rect(0, 0, 210, 3, 'F')
  
  // Logo area - circular with brand color
  doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.circle(25, 25, 12, 'F')
  doc.setFillColor(255, 255, 255)
  doc.circle(25, 25, 10, 'F')
  doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text('SB', 19, 28)
  
  // Company name with modern styling
  doc.setFontSize(28)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('Sulphuric Bench', 42, 27)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 180, 180)
  doc.text('Premium Digital Learning Platform', 42, 35)
  
  // Invoice badge with modern design
  doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.roundedRect(130, 12, 70, 35, 4, 4, 'F')
  
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('INVOICE', 142, 25)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(255, 255, 255)
  doc.text(`#${invoiceData.invoiceNumber}`, 142, 33)
  doc.text(invoiceData.date, 142, 40)
  
  // Company contact info
  doc.setFontSize(8)
  doc.setTextColor(200, 200, 200)
  doc.text('Email: support@sulphuricbench.com | Web: www.sulphuricbench.com', 20, 60)
  doc.text('Empowering Education Through Technology', 20, 65)
  
  // Elegant separator line
  doc.setDrawColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.setLineWidth(1)
  doc.line(20, 72, 190, 72)
  
  // Student Information Card
  doc.setFillColor(245, 248, 255)
  doc.roundedRect(20, 80, 85, 45, 3, 3, 'F')
  doc.setDrawColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.setLineWidth(0.5)
  doc.roundedRect(20, 80, 85, 45, 3, 3)
  
  // "BILL TO" header with icon
  doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.rect(20, 80, 85, 8, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('STUDENT INFORMATION', 25, 85)
  
  // Student details
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(invoiceData.studentName, 25, 97)
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Email: ${invoiceData.email}`, 25, 105)
  doc.text(`Phone: ${invoiceData.phone || 'N/A'}`, 25, 112)
  doc.text(`Date: ${invoiceData.date}`, 25, 119)
  
  // Payment Status & Access Code Card
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(110, 80, 80, 45, 3, 3, 'F')
  doc.setDrawColor(5, 150, 105)
  doc.setLineWidth(0.5)
  doc.roundedRect(110, 80, 80, 45, 3, 3)
  
  // Status header
  doc.setFillColor(5, 150, 105)
  doc.rect(110, 80, 80, 8, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('STATUS & ACCESS', 115, 85)
  
  // Payment status
  doc.setFontSize(12)
  doc.setTextColor(5, 150, 105)
  doc.setFont('helvetica', 'bold')
  doc.text(`✓ ${invoiceData.status || 'PAID'}`, 115, 97)
  
  // Access code section
  doc.setFontSize(8)
  doc.setTextColor(60, 60, 60)
  doc.setFont('helvetica', 'normal')
  doc.text('Course Access Code:', 115, 107)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.text(invoiceData.accessCode, 115, 115)
  
  // Course Details Section
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text('COURSE DETAILS', 20, 135)
  
  // Table header with gradient effect
  doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.rect(20, 142, 170, 11, 'F')
  
  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('COURSE & DESCRIPTION', 25, 149)
  doc.text('AMOUNT (৳)', 165, 149)
  
  // Table content row
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.rect(20, 153, 170, 30)
  
  // Course name and description
  doc.setFontSize(11)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  const courseLines = doc.splitTextToSize(invoiceData.courseName, 115)
  let yPos = 161
  courseLines.forEach((line: string, i: number) => {
    if (i === 0) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
    } else {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
    }
    doc.text(line, 25, yPos + (i * 5))
  })
  
  // Additional info
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.setFont('helvetica', 'italic')
  doc.text('✓ Lifetime Access | ✓ Certificate Included', 25, yPos + (courseLines.length * 5) + 5)
  
  // Amount
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(15, 23, 42)
  doc.text(`৳${invoiceData.amount}`, 165, 165)
  
  // Total Amount Section
  yPos = 190
  doc.setFillColor(15, 23, 42)
  doc.roundedRect(115, yPos, 75, 22, 3, 3, 'F')
  
  doc.setFontSize(11)
  doc.setTextColor(200, 200, 200)
  doc.setFont('helvetica', 'normal')
  doc.text('TOTAL AMOUNT:', 120, yPos + 8)
  
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.text(`৳${invoiceData.amount}`, 165, yPos + 8)
  
  doc.setFontSize(8)
  doc.setTextColor(180, 180, 180)
  doc.setFont('helvetica', 'normal')
  doc.text('Bangladeshi Taka (BDT)', 120, yPos + 16)
  
  // Payment Details Section
  yPos = 220
  doc.setFillColor(245, 248, 255)
  doc.roundedRect(20, yPos, 170, 32, 3, 3, 'F')
  doc.setDrawColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.setLineWidth(0.5)
  doc.roundedRect(20, yPos, 170, 32, 3, 3)
  
  // Payment info header
  doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.rect(20, yPos, 170, 8, 'F')
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)
  doc.text('PAYMENT DETAILS', 25, yPos + 5)
  
  // Payment information
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(60, 60, 60)
  doc.text(`Transaction ID: ${invoiceData.transactionId}`, 25, yPos + 16)
  doc.text(`Payment Method: ${invoiceData.paymentMethod.toUpperCase().replace('_', ' ')}`, 25, yPos + 23)
  doc.text(`Payment Date: ${invoiceData.date}`, 25, yPos + 30)
  
  // Footer Section
  yPos = 260
  // Accent line
  doc.setDrawColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.setLineWidth(2)
  doc.line(20, yPos, 190, yPos)
  
  // Thank you message
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.text('Thank you for choosing Sulphuric Bench!', 20, yPos + 8)
  
  // Contact information
  doc.setFontSize(8)
  doc.setTextColor(80, 80, 80)
  doc.setFont('helvetica', 'normal')
  doc.text('Support: support@sulphuricbench.com | Website: www.sulphuricbench.com', 20, yPos + 15)
  doc.text('This is a computer-generated invoice. No signature required.', 20, yPos + 20)
  
  // Professional watermark
  doc.setFontSize(60)
  doc.setTextColor(245, 250, 255)
  doc.text('PAID', 50, 175, { angle: 45 })
  
  // Bottom accent
  doc.setFillColor(primaryBlue.r, primaryBlue.g, primaryBlue.b)
  doc.rect(0, 294, 210, 3, 'F')
  
  return doc
}

export function downloadInvoice(invoiceData: InvoiceData) {
  const doc = generateInvoicePDF(invoiceData)
  doc.save(`Invoice_${invoiceData.invoiceNumber}.pdf`)
}

export function generateInvoiceNumber(gender?: 'M' | 'F', sscYear?: string): string {
  const prefix = 'SB'
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '') // YYYYMMDD
  const sscCode = sscYear ? `S${sscYear}` : 'S2024'
  const genderCode = gender === 'M' ? 'M' : gender === 'F' ? 'F' : 'M'
  const serial = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${date}-${sscCode}-${genderCode}-${serial}`
}