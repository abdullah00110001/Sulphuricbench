
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Users, 
  Palette, 
  CreditCard, 
  Shield,
  Save,
  AlertTriangle
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface PlatformSettings {
  signups_enabled: boolean
  global_dark_mode: boolean
  maintenance_mode: boolean
  sslcommerz_enabled: boolean
  bkash_manual_enabled: boolean
  bkash_merchant_number: string
  max_file_upload_size: number
  require_email_verification: boolean
}

export function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSettings>({
    signups_enabled: true,
    global_dark_mode: false,
    maintenance_mode: false,
    sslcommerz_enabled: true,
    bkash_manual_enabled: true,
    bkash_merchant_number: '01309878503',
    max_file_upload_size: 50,
    require_email_verification: true
  })
  
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: currentSettings, isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value')

      if (error) throw error
      
      const settingsObj: Record<string, any> = {}
      data?.forEach(setting => {
        settingsObj[setting.key] = setting.value
      })
      
      return settingsObj
    }
  })

  useEffect(() => {
    if (currentSettings && Object.keys(currentSettings).length > 0) {
      setSettings(prev => ({
        ...prev,
        ...Object.keys(currentSettings).reduce((acc, key) => {
          const value = currentSettings[key]
          if (key === 'signups_enabled' || key === 'global_dark_mode' || key === 'maintenance_mode' || 
              key === 'sslcommerz_enabled' || key === 'bkash_manual_enabled' || key === 'require_email_verification') {
            (acc as any)[key] = String(value) === 'true'
          } else if (key === 'max_file_upload_size') {
            (acc as any)[key] = parseInt(String(value)) || 50
          } else {
            (acc as any)[key] = String(value)
          }
          return acc
        }, {} as Partial<PlatformSettings>)
      }))
    }
  }, [currentSettings])

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: PlatformSettings) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: String(value),
        description: getSettingDescription(key)
      }))

      for (const update of updates) {
        await supabase
          .from('site_settings')
          .upsert(update, { onConflict: 'key' })
      }

      return newSettings
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] })
      queryClient.invalidateQueries({ queryKey: ['payment-settings'] })
      toast({ title: 'Settings updated successfully' })
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating settings',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const getSettingDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      signups_enabled: 'Allow new user registrations',
      global_dark_mode: 'Force dark mode for all users',
      maintenance_mode: 'Enable maintenance mode',
      sslcommerz_enabled: 'Enable SSLCommerz online payments',
      bkash_manual_enabled: 'Enable bKash manual payments',
      bkash_merchant_number: 'bKash merchant number for manual payments',
      max_file_upload_size: 'Maximum file upload size in MB',
      require_email_verification: 'Require email verification for new accounts'
    }
    return descriptions[key] || 'Platform setting'
  }

  const handleSwitchChange = (key: keyof PlatformSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleInputChange = (key: keyof PlatformSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateSettingsMutation.mutate(settings)
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Platform Settings</h2>
        <p className="text-muted-foreground">Configure global platform settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic platform configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>User Registration</Label>
                <p className="text-sm text-muted-foreground">
                  Allow new users to create accounts
                </p>
              </div>
              <Switch
                checked={settings.signups_enabled}
                onCheckedChange={(checked) => handleSwitchChange('signups_enabled', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Require email verification for new accounts
                </p>
              </div>
              <Switch
                checked={settings.require_email_verification}
                onCheckedChange={(checked) => handleSwitchChange('require_email_verification', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="max-upload">Maximum File Upload Size (MB)</Label>
              <Input
                id="max-upload"
                type="number"
                value={settings.max_file_upload_size}
                onChange={(e) => handleInputChange('max_file_upload_size', parseInt(e.target.value))}
                className="w-32"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance Settings
            </CardTitle>
            <CardDescription>
              Control the visual appearance of the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Global Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Force dark mode for all users (overrides user preference)
                </p>
              </div>
              <Switch
                checked={settings.global_dark_mode}
                onCheckedChange={(checked) => handleSwitchChange('global_dark_mode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>
              Configure payment methods and merchant information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SSLCommerz Online Payment</Label>
                <p className="text-sm text-muted-foreground">
                  Enable SSLCommerz gateway for card and online payments
                </p>
              </div>
              <Switch
                checked={settings.sslcommerz_enabled}
                onCheckedChange={(checked) => handleSwitchChange('sslcommerz_enabled', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>bKash Manual Payment</Label>
                <p className="text-sm text-muted-foreground">
                  Enable manual bKash payment with admin approval
                </p>
              </div>
              <Switch
                checked={settings.bkash_manual_enabled}
                onCheckedChange={(checked) => handleSwitchChange('bkash_manual_enabled', checked)}
              />
            </div>
            
            {settings.bkash_manual_enabled && (
              <div className="space-y-2">
                <Label htmlFor="bkash-number">bKash Merchant Number</Label>
                <Input
                  id="bkash-number"
                  value={settings.bkash_merchant_number}
                  onChange={(e) => handleInputChange('bkash_merchant_number', e.target.value)}
                  placeholder="+8801234567890"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              System Settings
            </CardTitle>
            <CardDescription>
              Critical system configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Maintenance Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable maintenance mode (blocks all user access)
                </p>
              </div>
              <Switch
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => handleSwitchChange('maintenance_mode', checked)}
              />
            </div>
            
            {settings.maintenance_mode && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Warning</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                  Maintenance mode is currently enabled. Regular users will not be able to access the platform.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending}
            size="lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateSettingsMutation.isPending ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
