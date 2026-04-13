"use client"

import { useEffect, useState, useCallback } from "react"
import { getClaims, getMembers, getCurrentUser } from "@/lib/storage"
import { FileText } from "lucide-react"

export default function MemberDashboard() {
  const [stats, setStats] = useState({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    remainingMCB: 150000,
  })

  // We wrap this in useCallback so the function reference stays the same
  // and doesn't trigger the "changed size" error in useEffect.
  const loadStats = useCallback(() => {
    const user = getCurrentUser()
    if (!user) return

    const allClaims = getClaims()
    const allMembers = getMembers()

    // Find the member record linked to this user
    const memberProfile = allMembers.find(m => 
      m.userId === user.id || m.email === user.email
    )

    const memberId = memberProfile ? memberProfile.id : user.id

    // Filter claims specifically for this member identity
    const myClaims = allClaims.filter(
      (c) => String(c.memberId) === String(memberId) || String(c.createdBy) === String(user.id)
    )

    const pending = myClaims.filter(c => c.status === "submitted" || c.status === "pending-approval").length
    const approved = myClaims.filter(c => c.status === "approved").length
    const rejected = myClaims.filter(c => c.status === "rejected").length

    const usedMCB = myClaims
      .filter((c) => c.status === "approved")
      .reduce((sum, c) => sum + Number(c.amount || 0), 0)

    setStats({
      totalClaims: myClaims.length,
      pendingClaims: pending,
      approvedClaims: approved,
      rejectedClaims: rejected,
      remainingMCB: Math.max(0, 150000 - usedMCB),
    })
  }, []) // Empty dependency array means this function is created once

  useEffect(() => {
    // Initial load
    loadStats()

    // Listeners for updates
    window.addEventListener("claim-updated", loadStats)
    window.addEventListener("storage", loadStats) 

    return () => {
      window.removeEventListener("claim-updated", loadStats)
      window.removeEventListener("storage", loadStats)
    }
  }, [loadStats]) // The size of this array is now constant (exactly 1 item)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <FileText className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-800">Claims Overview</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Total Claims</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalClaims}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-yellow-100 shadow-sm border-l-4 border-l-yellow-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Pending</p>
          <p className="text-3xl font-bold text-gray-900">{stats.pendingClaims}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm border-l-4 border-l-green-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Approved</p>
          <p className="text-3xl font-bold text-gray-900">{stats.approvedClaims}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm border-l-4 border-l-red-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Rejected</p>
          <p className="text-3xl font-bold text-gray-900">{stats.rejectedClaims}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-purple-100 shadow-sm border-l-4 border-l-purple-500">
        <p className="text-sm font-medium text-gray-500 uppercase">Remaining MCB Limit</p>
        <p className="text-3xl font-bold text-gray-900">₱{stats.remainingMCB.toLocaleString()}</p>
        <div className="w-full bg-gray-100 h-2 rounded-full mt-4">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${(stats.remainingMCB / 150000) * 100}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Maximum Coverage Benefit: ₱150,000</p>
      </div>
    </div>
  )
}