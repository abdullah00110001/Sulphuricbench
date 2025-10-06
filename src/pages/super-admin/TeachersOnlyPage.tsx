
import { TeacherManager } from '@/components/super-admin/TeacherManager'

export default function TeachersOnlyPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#00CFFF]">Teacher Management</h1>
          <p className="text-muted-foreground">Manage all teachers in your education platform with full CRUD operations</p>
        </div>
      </div>

      <TeacherManager />
    </div>
  )
}
