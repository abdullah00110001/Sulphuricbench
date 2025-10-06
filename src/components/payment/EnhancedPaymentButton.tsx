import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { PaymentMethodToggle } from './PaymentMethodToggle'
import { BkashManualPaymentForm } from './BkashManualPaymentForm'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { CreditCard, X } from 'lucide-react'

interface EnhancedPaymentButtonProps {
  course: {
    id: string
    title: string
    price: number
    thumbnail_url?: string
  }
  className?: string
  children?: React.ReactNode
}

export function EnhancedPaymentButton({ course, className, children }: EnhancedPaymentButtonProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'sslcommerz' | 'bkash' | null>(null)

  const handleClick = () => {
    if (!user) {
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname))
      return
    }
    
    setIsDialogOpen(true)
  }

  const handleMethodSelect = (method: 'sslcommerz' | 'bkash') => {
    setSelectedMethod(method)
  }

  const handleEnrollmentSuccess = () => {
    setIsDialogOpen(false)
    setSelectedMethod(null)
  }

  const handleBack = () => {
    setSelectedMethod(null)
  }

  const renderContent = () => {
    if (!selectedMethod) {
      return (
        <PaymentMethodToggle 
          course={course}
          onMethodSelect={handleMethodSelect}
        />
      )
    }

    if (selectedMethod === 'bkash') {
      return (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4"
          >
            ← Back to Payment Methods
          </Button>
          <BkashManualPaymentForm
            courseId={course.id}
            courseTitle={course.title}
            amount={course.price}
            merchantNumber="01309878503"
            onSuccess={handleEnrollmentSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </div>
      )
    }

    if (selectedMethod === 'sslcommerz') {
      return (
        <div className="space-y-4">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="mb-4"
          >
            ← Back to Payment Methods
          </Button>
          <PaymentMethodSelector
            course={course}
            onSuccess={handleEnrollmentSuccess}
          />
        </div>
      )
    }
  }

  return (
    <>
      <Button 
        onClick={handleClick}
        className={`${className} hover:scale-105 transition-transform duration-200`}
        size="lg"
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {children || `Enroll Now - ৳${course.price}`}
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
            <button
              onClick={() => {
                setIsDialogOpen(false)
                setSelectedMethod(null)
              }}
              className="absolute top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full p-2 transition-colors duration-200 shadow-md"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="overflow-y-auto max-h-[90vh] p-6">
              {renderContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}