import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/integrations/supabase/client'
import { Settings, Save, Mail, Globe, Users, Bell } from 'lucide-react'
import { toast } from 'sonner'

interface Setting {
  id: string
  key: string
  value: any
  description: string | null
  updated_at: string
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [siteTitle, setSiteTitle] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [allowTeacherApplications, setAllowTeacherApplications] = useState(true)
  const [enableNotifications, setEnableNotifications] = useState(true)
  const [enableNewsletter, setEnableNewsletter] = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .in('key', [
          'site_title',
          'support_email', 
          'allow_teacher_applications',
          'enable_notifications',
          'enable_newsletter',
          'maintenance_mode'
        ])

      if (error) {
        console.error('Error fetching settings:', error)
        return []
      }

      return data || []
    }
  })

  // Handle data processing when query succeeds
  useEffect(() => {
    if (settings && settings.length > 0) {
      settings.forEach(setting => {
        switch (setting.key) {
          case 'site_title':
            setSiteTitle(typeof setting.value === 'string' ? setting.value : 'Sulphuric Bench')
            break
          case 'support_email':
            setSupportEmail(typeof setting.value === 'string' ? setting.value : 'support@sulphuricbench.com')
            break
          case 'allow_teacher_applications':
            setAllowTeacherApplications(setting.value !== false)
            break
          case 'enable_notifications':
            setEnableNotifications(setting.value !== false)
            break
          case 'enable_newsletter':
            setEnableNewsletter(setting.value !== false)
            break
          case 'maintenance_mode':
            setMaintenanceMode(setting.value === true)
            break
        }
      })
    }
  }, [settings])

  const updateSetting = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: any; description: string }) => {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value,
          description
        }, {
          onConflict: 'key'
        })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platform-settings'] })
      toast.success('Settings updated successfully!')
    },
    onError: (error) => {
      toast.error('Failed to update settings')
      console.error('Error updating settings:', error)
    }
  })

  const saveGeneralSettings = () => {
    Promise.all([
      updateSetting.mutate({
        key: 'site_title',
        value: siteTitle,
        description: 'Main site title displayed across the platform'
      }),
      updateSetting.mutate({
        key: 'support_email',
        value: supportEmail,
        description: 'Email address for user support and contact'
      })
    ])
  }

  const saveUserSettings = () => {
    Promise.all([
      updateSetting.mutate({
        key: 'allow_teacher_applications',
        value: allowTeacherApplications,
        description: 'Allow new users to apply to become teachers'
      }),
      updateSetting.mutate({
        key: 'enable_notifications',
        value: enableNotifications,
        description: 'Enable platform-wide notifications'
      })
    ])
  }

  const saveSystemSettings = () => {
    Promise.all([
      updateSetting.mutate({
        key: 'enable_newsletter',
        value: enableNewsletter,
        description: 'Enable newsletter subscription functionality'
      }),
      updateSetting.mutate({
        key: 'maintenance_mode',
        value: maintenanceMode,
        description: 'Put the platform in maintenance mode'
      })
    ])
  }

  const getLastUpdated = (key: string) => {
    const setting = settings.find(s => s.key === key)
    return setting?.updated_at ? new Date(setting.updated_at).toLocaleDateString() : 'Never'
  }

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
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure your platform settings and preferences</p>
        </div>
      </div>

      {/* Settings Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Site Title</p>
                <p className="text-lg font-bold truncate">{siteTitle || 'Not Set'}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Support Email</p>
                <p className="text-lg font-bold truncate">{supportEmail || 'Not Set'}</p>
              </div>
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Teacher Applications</p>
                <p className="text-lg font-bold">{allowTeacherApplications ? 'Enabled' : 'Disabled'}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notifications</p>
                <p className="text-lg font-bold">{enableNotifications ? 'Enabled' : 'Disabled'}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Platform Configuration
          </CardTitle>
          <CardDescription>
            Manage your platform settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="users">User Settings</TabsTrigger>
              <TabsTrigger value="system">System Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Site Title</label>
                  <Input
                    value={siteTitle}
                    onChange={(e) => setSiteTitle(e.target.value)}
                    placeholder="Enter site title..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This will be displayed in the browser title and throughout the platform
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Support Email</label>
                  <Input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    placeholder="support@yoursite.com"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email address users can contact for support
                  </p>
                </div>

                <Button
                  onClick={saveGeneralSettings}
                  disabled={updateSetting.isPending}
                  className="w-full"
                >
                  {updateSetting.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save General Settings
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Allow Teacher Applications</label>
                    <p className="text-xs text-muted-foreground">
                      Enable users to apply to become teachers on the platform
                    </p>
                  </div>
                  <Switch
                    checked={allowTeacherApplications}
                    onCheckedChange={setAllowTeacherApplications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Enable Notifications</label>
                    <p className="text-xs text-muted-foreground">
                      Allow the platform to send notifications to users
                    </p>
                  </div>
                  <Switch
                    checked={enableNotifications}
                    onCheckedChange={setEnableNotifications}
                  />
                </div>

                <Button
                  onClick={saveUserSettings}
                  disabled={updateSetting.isPending}
                  className="w-full"
                >
                  {updateSetting.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save User Settings
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Enable Newsletter</label>
                    <p className="text-xs text-muted-foreground">
                      Allow users to subscribe to newsletters and enable newsletter functionality
                    </p>
                  </div>
                  <Switch
                    checked={enableNewsletter}
                    onCheckedChange={setEnableNewsletter}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Maintenance Mode</label>
                    <p className="text-xs text-muted-foreground">
                      Put the platform in maintenance mode (only admins can access)
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <Button
                  onClick={saveSystemSettings}
                  disabled={updateSetting.isPending}
                  className="w-full"
                >
                  {updateSetting.isPending ? (
                    "Saving..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save System Settings
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Settings Info */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Information</CardTitle>
          <CardDescription>Last updated information for each setting category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">General Settings</h4>
              <div className="text-sm text-muted-foreground">
                <div>Site Title: {getLastUpdated('site_title')}</div>
                <div>Support Email: {getLastUpdated('support_email')}</div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">System Settings</h4>
              <div className="text-sm text-muted-foreground">
                <div>Newsletter: {getLastUpdated('enable_newsletter')}</div>
                <div>Maintenance Mode: {getLastUpdated('maintenance_mode')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
