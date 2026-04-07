"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, addAuditLog, initializeStorage } from "@/lib/storage"

export default function AuthGuard({ children, allowedRoles = [], requireAuth = true, permissionCheck = null }) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize storage on first load
    initializeStorage()

    const currentUser = getCurrentUser()

    if (requireAuth && !currentUser) {
      router.push("/login")
      return
    }

    // Check role-based access if allowedRoles is provided
    if (currentUser && allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
      addAuditLog("ACCESS_DENIED", `Role-based access denied to ${window.location.pathname}`, currentUser.id)
      router.push("/unauthorized")
      return
    }

    // Check permission-based access if permissionCheck function is provided
    if (currentUser && permissionCheck && typeof permissionCheck === 'function' && !permissionCheck(currentUser)) {
      addAuditLog("ACCESS_DENIED", `Permission-based access denied to ${window.location.pathname}`, currentUser.id)
      router.push("/unauthorized")
      return
    }

    setUser(currentUser)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return children
}
