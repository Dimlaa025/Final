"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, initializeStorage } from "@/lib/storage"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    initializeStorage()
    const currentUser = getCurrentUser()

    if (currentUser) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">We Care</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
