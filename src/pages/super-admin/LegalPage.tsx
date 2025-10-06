
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/integrations/supabase/client'
import { Gavel, Save, FileText, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface LegalContent {
  id: string
  type: string
  content: string
  created_at: string
  updated_at: string
}

export default function LegalPage() {
  const queryClient = useQueryClient()
  const [termsContent, setTermsContent] = useState('')
  const [privacyContent, setPrivacyContent] = useState('')

  const { data: legalContents = [], isLoading } = useQuery({
    queryKey: ['legal-contents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', ['terms_and_conditions', 'privacy_policy'])

      if (error) {
        console.error('Error fetching legal contents:', error)
        return []
      }

      return data || []
    }
  })

  // Handle data processing when query succeeds
  useEffect(() => {
    if (legalContents && legalContents.length > 0) {
      const terms = legalContents.find(item => item.key === 'terms_and_conditions')
      const privacy = legalContents.find(item => item.key === 'privacy_policy')
      
      if (terms?.value) {
        if (typeof terms.value === 'string') {
          setTermsContent(terms.value)
        } else if (typeof terms.value === 'object' && terms.value !== null && !Array.isArray(terms.value) && 'content' in terms.value) {
          setTermsContent(typeof terms.value.content === 'string' ? terms.value.content : '')
        }
      }
      if (privacy?.value) {
        if (typeof privacy.value === 'string') {
          setPrivacyContent(privacy.value)
        } else if (typeof privacy.value === 'object' && privacy.value !== null && !Array.isArray(privacy.value) && 'content' in privacy.value) {
          setPrivacyContent(typeof privacy.value.content === 'string' ? privacy.value.content : '')
        }
      }
    }
  }, [legalContents])

  const updateLegalContent = useMutation({
    mutationFn: async ({ type, content }: { type: string; content: string }) => {
      if (!content.trim()) {
        throw new Error('Content cannot be empty')
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: type,
          value: { content },
          description: type === 'terms_and_conditions' ? 'Terms and Conditions' : 'Privacy Policy'
        }, {
          onConflict: 'key'
        })

      if (error) throw error
    },
    onSuccess: (_, { type }) => {
      queryClient.invalidateQueries({ queryKey: ['legal-contents'] })
      const label = type === 'terms_and_conditions' ? 'Terms and Conditions' : 'Privacy Policy'
      toast.success(`${label} updated successfully!`)
    },
    onError: (error, { type }) => {
      const label = type === 'terms_and_conditions' ? 'Terms and Conditions' : 'Privacy Policy'
      toast.error(`Failed to update ${label}`)
      console.error('Error updating legal content:', error)
    }
  })

  const getLastUpdated = (type: string) => {
    const content = legalContents.find(item => item.key === type)
    return content?.updated_at ? new Date(content.updated_at).toLocaleDateString() : 'Never'
  }

  const defaultTermsContent = `# Terms and Conditions

## 1. Acceptance of Terms
By accessing and using Sulphuric Bench, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License
Permission is granted to temporarily access Sulphuric Bench for personal, non-commercial transitory viewing only.

## 3. User Accounts
- Users must provide accurate information when creating accounts
- Users are responsible for maintaining account security
- Users must not share account credentials

## 4. Course Content
- All course materials are protected by copyright
- Users may not redistribute course content without permission
- Course access is granted for personal learning only

## 5. Payment Terms
- Course fees are non-refundable unless specified otherwise
- Payment must be completed before course access is granted
- Prices are subject to change without notice

## 6. Prohibited Uses
You may not use our service:
- For any unlawful purpose or to solicit others to unlawful acts
- To violate any international, federal, provincial or state regulations, rules, laws, or local ordinances
- To infringe upon or violate our intellectual property rights or the intellectual property rights of others

## 7. Termination
We may terminate or suspend access immediately, without prior notice or liability, for any reason whatsoever.

## 8. Contact Information
If you have any questions about these Terms and Conditions, please contact us.`

const defaultPrivacyContent = `# Privacy Policy

## Information We Collect
We collect information you provide directly to us, such as when you create an account, enroll in courses, or contact us.

## How We Use Your Information
- To provide and maintain our service
- To process transactions
- To send you course updates and educational content
- To respond to your comments and questions

## Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

## Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## Cookies
We may use cookies to enhance your experience, gather general visitor information, and track visits to our website.

## Third-Party Services
Our service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites.

## Children's Privacy
Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.

## Changes to Privacy Policy
We reserve the right to update this privacy policy at any time. We will notify users of any changes by posting the new policy on this page.

## Contact Us
If you have questions about this Privacy Policy, please contact us.`

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Legal Content Management</h1>
          <p className="text-muted-foreground">Manage terms and conditions, privacy policy</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Terms Last Updated</p>
                <p className="text-lg font-bold">{getLastUpdated('terms_and_conditions')}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Privacy Last Updated</p>
                <p className="text-lg font-bold">{getLastUpdated('privacy_policy')}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legal Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-6 w-6" />
            Legal Content Editor
          </CardTitle>
          <CardDescription>
            Update your platform's legal documents. Changes will be reflected immediately on the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="terms" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
            </TabsList>

            <TabsContent value="terms" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Terms and Conditions</label>
                <Textarea
                  value={termsContent || defaultTermsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  placeholder="Enter your terms and conditions..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={() => updateLegalContent.mutate({ 
                  type: 'terms_and_conditions', 
                  content: termsContent || defaultTermsContent 
                })}
                disabled={updateLegalContent.isPending}
                className="w-full"
              >
                {updateLegalContent.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Terms & Conditions
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Privacy Policy</label>
                <Textarea
                  value={privacyContent || defaultPrivacyContent}
                  onChange={(e) => setPrivacyContent(e.target.value)}
                  placeholder="Enter your privacy policy..."
                  rows={20}
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={() => updateLegalContent.mutate({ 
                  type: 'privacy_policy', 
                  content: privacyContent || defaultPrivacyContent 
                })}
                disabled={updateLegalContent.isPending}
                className="w-full"
              >
                {updateLegalContent.isPending ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Privacy Policy
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Information */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Page Access</CardTitle>
          <CardDescription>
            Your legal documents are accessible to users at these URLs:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="font-medium">Terms & Conditions:</span>
              <code className="text-sm bg-background px-2 py-1 rounded">/terms</code>
            </div>
            <div className="flex items-center justify-between p-2 bg-muted rounded">
              <span className="font-medium">Privacy Policy:</span>
              <code className="text-sm bg-background px-2 py-1 rounded">/privacy</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
