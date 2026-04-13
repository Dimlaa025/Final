"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarInset, useSidebar } from "@/components/ui/sidebar" // Import useSidebar hook
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"
import { getCurrentUser, logoutUser } from "@/lib/storage"
import { useRouter } from "next/navigation"

// New inner layout to use useSidebar hook
function DashboardLayoutInner({ children, user }) {
  const router = useRouter()
  const { toggleSidebar } = useSidebar() // Hook into useSidebar

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar is now here, so it never resets */}
      <Sidebar user={user} />
      
      <SidebarInset className="flex flex-col flex-1 min-w-0">
        <Navbar user={user} onMenuClick={toggleSidebar} onLogout={handleLogout} /> {/* Pass toggleSidebar function */}
        <main className="flex-1 p-4 md:p-6 bg-gray-50/50">
          {children}
        </main>
      </SidebarInset>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
    } else {
      setUser(currentUser)
    }
  }, [router])

  if (!user) return null

  return (
    <SidebarProvider defaultOpen={true}>
      <DashboardLayoutInner children={children} user={user} />
    </SidebarProvider>
  )
}