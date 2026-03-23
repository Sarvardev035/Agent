import ProfileDropdown from "@/components/ui/profile-dropdown"

export default function ProfileDropdownDemo() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800">
      <ProfileDropdown
        userName="John Doe"
        userEmail="john@finly.io"
        userRole="Financial Analyst"
        onActivityLog={() => alert("Activity log clicked")}
        onSettings={() => alert("Settings clicked")}
        onIntegrations={() => alert("Integrations clicked")}
        onUpgrade={() => alert("Upgrade to Pro clicked")}
        onSignOut={() => alert("Sign out clicked")}
      />
    </div>
  )
}
