
import { useState } from "react"
import { SuperAdminStats } from "./SuperAdminStats"
import { ContentOverview } from "./ContentOverview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Plus, Settings, Users, BookOpen, TrendingUp } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function SuperAdminDashboard() {
  const navigate = useNavigate()

  const handleNavigation = (path: string) => {
    console.log('SuperAdminDashboard: Navigating to:', path)
    navigate(path)
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 pb-20 lg:pb-0 px-1 sm:px-2 lg:px-0 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#00CFFF] to-blue-600 bg-clip-text text-transparent flex items-center gap-2 sm:gap-3">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-[#00CFFF] flex-shrink-0" />
            <span className="leading-tight">Super Admin Dashboard</span>
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-400">
            Complete platform management and oversight
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button 
            onClick={() => handleNavigation('/super-admin/settings')}
            className="bg-gradient-to-r from-[#00CFFF] to-blue-600 hover:from-[#00B8E6] hover:to-blue-700 text-white text-xs sm:text-sm lg:text-base"
            size="sm"
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Quick Action
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleNavigation('/super-admin/settings')}
            className="border-[#00CFFF]/30 text-[#00CFFF] hover:bg-[#00CFFF]/10 text-xs sm:text-sm lg:text-base"
            size="sm"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="w-full">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
          Platform Statistics
        </h2>
        <SuperAdminStats />
      </div>

      {/* Content Management Overview */}
      <div className="w-full">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
          Content Overview
        </h2>
        <ContentOverview />
      </div>

      {/* Quick Actions Grid */}
      <div className="w-full">
        <h2 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
          <Card 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-xl hover:bg-white/95 dark:hover:bg-gray-800/95 transition-all duration-300 hover:scale-105"
            onClick={() => handleNavigation('/super-admin/users')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                User Management
              </CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#00CFFF]" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00CFFF]">Active</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Manage all platform users
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-xl hover:bg-white/95 dark:hover:bg-gray-800/95 transition-all duration-300 hover:scale-105"
            onClick={() => handleNavigation('/super-admin/courses')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Course Content
              </CardTitle>
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-[#00CFFF]" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00CFFF]">Live</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Manage courses and content
              </p>
            </CardContent>
          </Card>
          
          <Card 
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-xl hover:bg-white/95 dark:hover:bg-gray-800/95 transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1"
            onClick={() => handleNavigation('/super-admin/analytics')}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                Analytics
              </CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-[#00CFFF]" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[#00CFFF]">Running</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                View platform insights
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Platform Overview */}
      <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 w-full">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white text-base sm:text-lg lg:text-xl">
            Platform Management
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm lg:text-base">
            Use the sidebar navigation to manage different aspects of the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full">
            <div 
              className="p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50 rounded-lg cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
              onClick={() => handleNavigation('/super-admin/students')}
            >
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base">
                Manage Students
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                View and manage student accounts and progress
              </p>
            </div>
            <div 
              className="p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50 rounded-lg cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm"
              onClick={() => handleNavigation('/super-admin/courses')}
            >
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base">
                Content Management
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Manage courses and platform content
              </p>
            </div>
            <div 
              className="p-3 sm:p-4 border border-gray-200/50 dark:border-gray-600/50 rounded-lg cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors backdrop-blur-sm sm:col-span-2 lg:col-span-1"
              onClick={() => handleNavigation('/super-admin/analytics')}
            >
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base">
                Platform Analytics
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                View detailed platform analytics and insights
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
