
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth"
import { DashboardOverview } from "./DashboardOverview"
import { MyCourses } from "./MyCourses"
import { BrowseCourses } from "./BrowseCourses"
import { ProfileManagement } from "./ProfileManagement"
import { PaymentHistory } from "./PaymentHistory"
import { ReviewsRatings } from "./ReviewsRatings"

export function StudentDashboard() {
  const { user, profile } = useAuth()


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {profile?.full_name || user?.email?.split('@')[0] || 'Student'}! 🎓
          </h1>
          <p className="text-muted-foreground mt-2">
            Continue your learning journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <DashboardOverview />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <MyCourses />
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          <BrowseCourses />
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <ProfileManagement />
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <PaymentHistory />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <ReviewsRatings />
        </TabsContent>
      </Tabs>
    </div>
  )
}
