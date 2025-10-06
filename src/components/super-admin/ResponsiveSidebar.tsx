
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { MobileLogoutButton } from './MobileLogoutButton'
import { useIsMobile } from '@/hooks/use-mobile'

export function ResponsiveSidebar() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  if (!isMobile) {
    return <Sidebar />
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b lg:hidden">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <h1 className="text-lg font-semibold">Super Admin</h1>
          </div>
          <MobileLogoutButton />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
    </>
  )
}
