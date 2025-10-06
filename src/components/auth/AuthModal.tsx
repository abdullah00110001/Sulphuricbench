
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AuthTabSelector } from "./AuthTabSelector"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: "login" | "signup"
}

export function AuthModal({ isOpen, onClose, defaultTab = "login" }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleSuccess = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to Sulphuric Bench</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one to start learning
          </DialogDescription>
        </DialogHeader>
        
        <AuthTabSelector 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onSuccess={handleSuccess}
        />
        
        {/* Hidden trigger for external access */}
        <button data-auth-modal className="hidden" onClick={() => setActiveTab("signup")} />
      </DialogContent>
    </Dialog>
  )
}
