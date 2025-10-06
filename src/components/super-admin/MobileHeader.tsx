
import { Button } from "@/components/ui/button"
import { Menu, Bell } from "lucide-react"

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  return (
    <div className="lg:hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-3 sm:px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8 sm:h-9 sm:w-9"
        >
          <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <h1 className="text-sm sm:text-lg font-semibold truncate">Admin Panel</h1>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-9 sm:w-9"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
    </div>
  )
}
