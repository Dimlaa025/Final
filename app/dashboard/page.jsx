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
  const [mounted, setMounted] = useState(false)
  
  // 1. Initialize with a function to read from localStorage immediately on load
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)

    // 2. Read preference from storage immediately
    const saved = localStorage.getItem("sidebar_expanded")
    if (saved !== null) {
      setSidebarOpen(saved === "true")
    }
    setMounted(true)
  }, [])

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev
      localStorage.setItem("sidebar_expanded", newState.toString())
      return newState
    })
  }

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  const renderDashboard = () => {
    if (!user) return null
    switch (user.role) {
      case "IT/Admin": return <AdminDashboard user={user} />;
      case "Director": return <DirectorDashboard user={user} />;
      case "Assistant": return <AssistantDashboard user={user} />;
      default: return <MemberDashboard user={user} />;
    }
  }

  if (!user || !mounted) return null

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onClose={() => {
          // Note: OnClose is only called by the mobile backdrop
          setSidebarOpen(false)
          localStorage.setItem("sidebar_expanded", "false")
        }} 
      />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">
        <Navbar 
          user={user} 
          onMenuClick={toggleSidebar} 
          onLogout={handleLogout} 
        />
        
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {renderDashboard()}
          </div>
        </main>
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