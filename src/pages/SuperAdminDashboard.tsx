
import { SuperAdminStats } from "@/components/super-admin/SuperAdminStats"
import { ContentOverview } from "@/components/super-admin/ContentOverview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { Users, BookOpen, BarChart3, Settings } from "lucide-react"

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your learning platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleNavigation('/super-admin/analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
          <Button variant="outline" onClick={() => handleNavigation('/super-admin/settings')}>
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <SuperAdminStats />

      {/* Content Overview */}
      <ContentOverview />

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/super-admin/users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Management</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Quick Access</div>
            <p className="text-xs text-muted-foreground">
              Manage students, teachers, and administrators
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/super-admin/courses')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Content</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manage</div>
            <p className="text-xs text-muted-foreground">
              Create and manage course content
            </p>
          </CardContent>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleNavigation('/super-admin/analytics')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Insights</div>
            <p className="text-xs text-muted-foreground">
              View platform performance metrics
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Management */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
          <CardDescription>
            Access all administrative functions and tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="cursor-pointer p-4 rounded-lg border hover:bg-accent transition-colors"
                 onClick={() => handleNavigation('/super-admin/students')}>
              <h3 className="font-semibold mb-2">Students</h3>
              <p className="text-sm text-muted-foreground">
                View and manage student accounts and progress
              </p>
            </div>
            
            <div className="cursor-pointer p-4 rounded-lg border hover:bg-accent transition-colors"
                 onClick={() => handleNavigation('/super-admin/courses')}>
              <h3 className="font-semibold mb-2">Content</h3>
              <p className="text-sm text-muted-foreground">
                Manage courses, materials, and educational content
              </p>
            </div>
            
            <div className="cursor-pointer p-4 rounded-lg border hover:bg-accent transition-colors"
                 onClick={() => handleNavigation('/super-admin/analytics')}>
              <h3 className="font-semibold mb-2">Platform Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Monitor usage, performance, and user engagement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
