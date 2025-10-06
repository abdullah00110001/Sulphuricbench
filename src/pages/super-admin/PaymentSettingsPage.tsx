import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { supabase } from '@/integrations/supabase/client'
import { CreditCard, Smartphone, Settings, Save, Loader2 } from 'lucide-react'

interface PaymentSettings {
  sslcommerz_enabled: boolean
  bkash_enabled: boolean
  sslcommerz_store_id: string
  sslcommerz_store_password: string
  bkash_instructions: string
}

export default function PaymentSettingsPage() {
  // Simple super admin check using localStorage
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true'
  const [settings, setSettings] = useState<PaymentSettings>({
    sslcommerz_enabled: true,
    bkash_enabled: true,
    sslcommerz_store_id: '',
    sslcommerz_store_password: '',
    bkash_instructions: 'Please send money to our bKash merchant number and submit your transaction details below.'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const healthCheck = async () => {
    try {
      const superAdminEmail = (localStorage.getItem('superAdminEmail') || '').trim().toLowerCase()
      if (!superAdminEmail) return
      const { data, error } = await supabase.functions.invoke('manage-payment-settings', {
        body: { action: 'health', email: superAdminEmail }
      })
      if (error) {
        console.error('Edge Function health check failed:', error)
      } else {
        console.log('Edge Function health check:', data)
      }
    } catch (e) {
      console.error('Health check error:', e)
    }
  }

  useEffect(() => {
    if (isSuperAdmin) {
      loadSettings()
    } else {
      setLoading(false)
    }
  }, [isSuperAdmin])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You need to be logged in as a super admin to access this page.</p>
        </div>
      </div>
    )
  }

  const loadSettings = async () => {
    try {
      const superAdminEmail = (localStorage.getItem('superAdminEmail') || '').trim().toLowerCase()
      if (!superAdminEmail) {
        toast.error('Super admin email not found')
        return
      }

      const { data, error } = await supabase.functions.invoke('manage-payment-settings', {
        body: {
          action: 'get',
          email: superAdminEmail
        }
      })

      if (error) throw error

      if (data?.data) {
        setSettings({
          sslcommerz_enabled: data.data.sslcommerz_enabled,
          bkash_enabled: data.data.bkash_enabled,
          sslcommerz_store_id: data.data.sslcommerz_store_id || '',
          sslcommerz_store_password: data.data.sslcommerz_store_password || '',
          bkash_instructions: data.data.bkash_instructions || 'Please send money to our bKash merchant number and submit your transaction details below.'
        })
      }
    } catch (error) {
      console.error('Error loading payment settings:', error)
      toast.error('Failed to load payment settings.')
      await healthCheck()
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!isSuperAdmin) {
      toast.error('You must be logged in as a super admin to save settings.')
      return
    }

    const superAdminEmail = (localStorage.getItem('superAdminEmail') || '').trim().toLowerCase()
    if (!superAdminEmail) {
      toast.error('Super admin email not found')
      return
    }

    setSaving(true)
    try {
      const { data, error } = await supabase.functions.invoke('manage-payment-settings', {
        body: {
          action: 'update',
          email: superAdminEmail,
          settings
        }
      })

      if (error) throw error

      toast.success('Payment settings have been updated successfully.')
    } catch (error) {
      console.error('Error saving payment settings:', error)
      toast.error('Failed to update payment settings.')
      await healthCheck()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
        <p className="text-muted-foreground">
          Configure payment methods and gateway settings
        </p>
      </div>

      <div className="grid gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Enable or disable payment methods for your platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* SSLCommerz Settings */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">SSLCommerz</h3>
                  <p className="text-sm text-muted-foreground">
                    Online payment gateway for credit/debit cards
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.sslcommerz_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, sslcommerz_enabled: checked}))
                }
              />
            </div>

            {/* bKash Settings */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-6 w-6 text-pink-600" />
                <div>
                  <h3 className="font-medium">bKash Manual</h3>
                  <p className="text-sm text-muted-foreground">
                    Manual bKash payment verification
                  </p>
                </div>
              </div>
              <Switch
                checked={settings.bkash_enabled}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({...prev, bkash_enabled: checked}))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* SSLCommerz Configuration */}
        {settings.sslcommerz_enabled && (
          <Card>
            <CardHeader>
              <CardTitle>SSLCommerz Configuration</CardTitle>
              <CardDescription>
                Configure your SSLCommerz gateway credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="store_id">Store ID</Label>
                <Input
                  id="store_id"
                  value={settings.sslcommerz_store_id}
                  onChange={(e) => 
                    setSettings(prev => ({...prev, sslcommerz_store_id: e.target.value}))
                  }
                  placeholder="Enter your SSLCommerz Store ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="store_password">Store Password</Label>
                <Input
                  id="store_password"
                  type="password"
                  value={settings.sslcommerz_store_password}
                  onChange={(e) => 
                    setSettings(prev => ({...prev, sslcommerz_store_password: e.target.value}))
                  }
                  placeholder="Enter your SSLCommerz Store Password"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* bKash Configuration */}
        {settings.bkash_enabled && (
          <Card>
            <CardHeader>
              <CardTitle>bKash Configuration</CardTitle>
              <CardDescription>
                Configure instructions for manual bKash payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bkash_instructions">Payment Instructions</Label>
                <Textarea
                  id="bkash_instructions"
                  value={settings.bkash_instructions}
                  onChange={(e) => 
                    setSettings(prev => ({...prev, bkash_instructions: e.target.value}))
                  }
                  placeholder="Enter instructions for users on how to make bKash payments"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}