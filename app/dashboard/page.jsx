"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logoutUser } from "@/lib/storage"
import AuthGuard from "@/components/auth-guard"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import AdminDashboard from "@/components/dashboards/admin-dashboard"
import DirectorDashboard from "@/components/dashboards/director-dashboard"
import AssistantDashboard from "@/components/dashboards/assistant-dashboard"
import MemberDashboard from "@/components/dashboards/member-dashboard"

function DashboardContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "IT/Admin":
        return <AdminDashboard user={user} />
      case "Director":
        return <DirectorDashboard user={user} />
      case "Assistant":
        return <AssistantDashboard user={user} />
      case "Member":
        return <MemberDashboard user={user} />
      default:
        return <MemberDashboard user={user} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto">{renderDashboard()}</main>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardContent />
    </AuthGuard>
  )
}
