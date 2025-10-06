
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Send } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

export function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if email already exists
      const { data: existingSubscription } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("email", email)
        .eq("is_active", true)
        .single()

      if (existingSubscription) {
        toast({
          title: "Already subscribed",
          description: "This email is already subscribed to our newsletter",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }

      // Use the newsletter subscribe edge function
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email }
      })

      if (error) {
        console.error('Newsletter subscription error:', error)
        toast({
          title: "Subscription failed",
          description: "There was an error subscribing. Please try again.",
          variant: "destructive"
        })
        return
      }

      if (data.success) {
        toast({
          title: "✅ Subscription successful",
          description: "Thank you for subscribing! Check your email for confirmation.",
        })
        setEmail("")
      }

    } catch (error) {
      console.error('Subscription error:', error)
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-r from-brand-sky to-brand-sky-light">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          <Mail className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Stay Updated with Latest Courses
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Get notified about new courses, special offers, and learning tips. 
            Join our community of learners today!
          </p>

          <form onSubmit={handleSubscribe} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-black placeholder:text-gray-500 border-0 flex-1"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-brand-navy hover:bg-brand-navy/90 text-white px-8"
                size="lg"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Subscribe
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-white/80 mt-3">
              No spam, unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
