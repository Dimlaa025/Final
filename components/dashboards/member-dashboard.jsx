"use client"

import { useEffect, useState } from "react"
import { getClaims } from "@/lib/storage"
import { canViewOwnClaims } from "@/lib/permissions"
import { FileText } from "lucide-react"

export default function MemberDashboard({ user }) {
  const [stats, setStats] = useState({
    totalClaims: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    remainingMCB: 150000, // ₱150,000 MCB limit
  })

  useEffect(() => {
    const loadStats = () => {
      // Only load data that user has permission to view
      const allClaims = canViewOwnClaims(user) ? getClaims() : []
      const myClaims = allClaims.filter((c) => c.memberId === user.id)

      const totalClaims = myClaims.length
      const pendingClaims = myClaims.filter((c) => c.status === "submitted" || c.status === "pending-approval").length
      const approvedClaims = myClaims.filter((c) => c.status === "approved").length
      const rejectedClaims = myClaims.filter((c) => c.status === "rejected").length

      // Calculate used MCB from approved claims (including dependents' claims)
      const usedMCB = myClaims
        .filter((c) => c.status === "approved")
        .reduce((sum, c) => sum + Number.parseFloat(c.amount || 0), 0)

      const remainingMCB = 150000 - usedMCB

      setStats({
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims,
        remainingMCB: Math.max(0, remainingMCB), // Ensure non-negative
      })
    }

    loadStats()
  }, [user])

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Claims Overview Section */}
      {canViewOwnClaims(user) && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Claims Overview</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6 border min-h-[72px] sm:min-h-[80px] lg:min-h-[96px] border-l-4 border-blue-500">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-xs font-medium opacity-80 leading-tight">Total Claims</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats.totalClaims}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6 border min-h-[72px] sm:min-h-[80px] lg:min-h-[96px] border-l-4 border-yellow-500">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-xs font-medium opacity-80 leading-tight">Pending Claims</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats.pendingClaims}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6 border min-h-[72px] sm:min-h-[80px] lg:min-h-[96px] border-l-4 border-green-500">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-xs font-medium opacity-80 leading-tight">Approved Claims</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats.approvedClaims}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6 border min-h-[72px] sm:min-h-[80px] lg:min-h-[96px] border-l-4 border-red-500">
              <div className="flex items-center justify-between h-full">
                <div className="flex-1">
                  <p className="text-xs font-medium opacity-80 leading-tight">Rejected Claims</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">{stats.rejectedClaims}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm hover:shadow-md transition-shadow p-3 sm:p-4 lg:p-6 border min-h-[72px] sm:min-h-[80px] lg:min-h-[96px] border-l-4 border-purple-500">
            <div className="flex items-center justify-between h-full">
              <div className="flex-1">
                <p className="text-xs font-medium opacity-80 leading-tight">Remaining MCB Limit</p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold mt-1">₱{stats.remainingMCB.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Maximum Coverage Benefit: ₱150,000</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
