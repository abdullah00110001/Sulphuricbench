
import { EnhancedCourseCreator } from '@/components/super-admin/EnhancedCourseCreator'
import { CourseManager } from '@/components/super-admin/CourseManager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function FutureCoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#00CFFF]">Sulphuric Bench - Course Management</h1>
          <p className="text-muted-foreground">Manage courses and content for your education platform</p>
        </div>
        <div className="flex gap-2">
          <EnhancedCourseCreator />
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="courses" className="data-[state=active]:bg-[#00CFFF] data-[state=active]:text-white">
            Courses
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#00CFFF] data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <CourseManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2 text-[#00CFFF]">Analytics Coming Soon</h3>
            <p className="text-muted-foreground">
              Detailed course analytics will be available here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
