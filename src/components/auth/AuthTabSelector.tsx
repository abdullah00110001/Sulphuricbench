
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthForm } from "./AuthForm"

interface AuthTabSelectorProps {
  activeTab: "login" | "signup"
  onTabChange: (tab: "login" | "signup") => void
  onSuccess: () => void
}

export function AuthTabSelector({ activeTab, onTabChange, onSuccess }: AuthTabSelectorProps) {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as "login" | "signup")}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login">
        <AuthForm mode="login" onSuccess={onSuccess} />
      </TabsContent>
      
      <TabsContent value="signup">
        <AuthForm mode="signup" onSuccess={onSuccess} />
      </TabsContent>
    </Tabs>
  )
}
