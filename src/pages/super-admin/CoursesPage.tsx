
import { EnhancedCourseCreator } from "@/components/super-admin/EnhancedCourseCreator"
import { CourseManager } from "@/components/super-admin/CourseManager"
import { CourseAnalytics } from "@/components/super-admin/CourseAnalytics"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CoursesPage() {
  console.log('CoursesPage rendered')
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Course Management</h1>
        <EnhancedCourseCreator />
      </div>
      
      <Tabs defaultValue="manage" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage" className="data-[state=active]:bg-[#00CFFF] data-[state=active]:text-white">
            Manage Courses
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#00CFFF] data-[state=active]:text-white">
            Course Analytics
          </TabsTrigger>
          <TabsTrigger value="bulk" className="data-[state=active]:bg-[#00CFFF] data-[state=active]:text-white">
            Bulk Actions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manage" className="mt-6">
          <CourseManager />
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <CourseAnalytics />
        </TabsContent>
        
        <TabsContent value="bulk" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Bulk course operations will be available here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
