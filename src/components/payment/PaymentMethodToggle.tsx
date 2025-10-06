import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Smartphone } from 'lucide-react'

interface PaymentMethodToggleProps {
  onMethodSelect: (method: 'sslcommerz' | 'bkash') => void
  course: {
    id: string
    title: string
    price: number
  }
}

export function PaymentMethodToggle({ onMethodSelect, course }: PaymentMethodToggleProps) {
  const [selectedMethod, setSelectedMethod] = useState<'sslcommerz' | 'bkash' | null>(null)

  const handleMethodSelect = (method: 'sslcommerz' | 'bkash') => {
    setSelectedMethod(method)
    onMethodSelect(method)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Select Payment Method</CardTitle>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-2xl font-bold text-primary">৳{course.price}</span>
          <Badge variant="outline">{course.title}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          variant={selectedMethod === 'sslcommerz' ? 'default' : 'outline'}
          className="w-full h-16 text-left"
          onClick={() => handleMethodSelect('sslcommerz')}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-6 w-6" />
            <div>
              <div className="font-medium">Online Payment</div>
              <div className="text-sm text-muted-foreground">Card, Mobile Banking, Internet Banking</div>
            </div>
          </div>
        </Button>

        <Button
          variant={selectedMethod === 'bkash' ? 'default' : 'outline'}
          className="w-full h-16 text-left"
          onClick={() => handleMethodSelect('bkash')}
        >
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6" />
            <div>
              <div className="font-medium">bKash Manual Payment</div>
              <div className="text-sm text-muted-foreground">Send money manually & submit details</div>
            </div>
          </div>
        </Button>
      </CardContent>
    </Card>
  )
}