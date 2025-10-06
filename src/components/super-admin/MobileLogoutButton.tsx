
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

export function MobileLogoutButton() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      // Clear localStorage first
      localStorage.removeItem('isSuperAdmin')
      localStorage.removeItem('superAdminEmail')
      
      // Clear all Supabase auth keys
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key)
        }
      })

      // Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' })
      
      toast({ title: 'Logged out successfully' })
      
      // Force page reload and redirect
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
      // Force redirect even if logout fails
      window.location.href = '/'
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleLogout}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 lg:hidden"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  )
}
