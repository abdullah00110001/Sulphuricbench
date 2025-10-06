
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'
import { Mail } from 'lucide-react'

export function NewsletterSubscription() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if email already exists
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('email', email)
        .single()

      if (existing) {
        toast({
          title: 'Already Subscribed',
          description: 'This email is already subscribed to our newsletter'
        })
        setEmail('')
        setIsLoading(false)
        return
      }

      // Insert new subscription
      const { error } = await supabase
        .from('subscriptions')
        .insert({ email, is_active: true })

      if (error) throw error

      toast({
        title: 'Subscribed Successfully!',
        description: 'Thank you for subscribing to our newsletter'
      })
      setEmail('')
    } catch (error: any) {
      toast({
        title: 'Subscription failed',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-lg text-white">
      <div className="flex items-center gap-2 mb-3">
        <Mail className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Subscribe to Our Newsletter</h3>
      </div>
      <p className="text-blue-100 mb-4">
        Get the latest updates on courses, blogs, and educational content.
      </p>
      <form onSubmit={handleSubscribe} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white text-gray-900"
          required
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-white text-blue-600 hover:bg-gray-100"
        >
          {isLoading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    </div>
  )
}
