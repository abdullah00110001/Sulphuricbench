
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Loader2, User, Mail, Phone, FileText, Briefcase, Link } from 'lucide-react'

interface BecomeInstructorModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BecomeInstructorModal({ open, onOpenChange }: BecomeInstructorModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualifications: '',
    experience: '',
    portfolioUrl: '',
    bio: ''
  })
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const submitApplicationMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Insert into teacher_applications table
      const { error } = await supabase
        .from('teacher_applications')
        .insert({
          user_id: null, // Will be set when user signs up
          qualifications: data.qualifications,
          experience: data.experience,
          portfolio_url: data.portfolioUrl || null,
          notes: `Name: ${data.fullName}\nEmail: ${data.email}\nPhone: ${data.phone}\nBio: ${data.bio}`
        })

      if (error) throw error

      // Also insert into teacher_registrations for compatibility
      const { error: regError } = await supabase
        .from('teacher_registrations')
        .insert({
          full_name: data.fullName,
          email: data.email,
          phone: data.phone,
          qualifications: data.qualifications,
          experience: data.experience,
          portfolio_url: data.portfolioUrl || null,
          bio: data.bio,
          status: 'pending'
        })

      if (regError) throw regError

      queryClient.invalidateQueries({ queryKey: ['teacher-applications'] })
      toast({
        title: 'Application Submitted!',
        description: 'Your instructor application has been submitted for review. You will receive an email once approved.'
      })
      onOpenChange(false)
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        qualifications: '',
        experience: '',
        portfolioUrl: '',
        bio: ''
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit application. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.fullName || !formData.email || !formData.qualifications || !formData.experience) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      })
      return
    }

    submitApplicationMutation.mutate(formData)
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Become an Instructor</DialogTitle>
          <DialogDescription className="text-center">
            Join our community of educators and share your knowledge with students worldwide
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="phone"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Educational Qualifications *</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
              <Textarea
                id="qualifications"
                placeholder="List your degrees, certifications, and relevant educational background..."
                value={formData.qualifications}
                onChange={(e) => handleInputChange('qualifications', e.target.value)}
                className="pl-10 min-h-[80px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Teaching/Professional Experience *</Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
              <Textarea
                id="experience"
                placeholder="Describe your teaching experience, professional background, and expertise areas..."
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="pl-10 min-h-[80px]"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="portfolioUrl">Portfolio/Website URL (optional)</Label>
            <div className="relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="portfolioUrl"
                type="url"
                placeholder="https://your-portfolio.com"
                value={formData.portfolioUrl}
                onChange={(e) => handleInputChange('portfolioUrl', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Why do you want to teach? (Optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your passion for teaching and what you'd like to share with students..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              className="min-h-[60px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitApplicationMutation.isPending}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {submitApplicationMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
