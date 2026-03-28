"use client"

import { useEffect, useState } from "react"
import { getClaims, getClaimsByMemberId } from "@/lib/storage"

export default function SummaryReport({ user, personal = false }) {
  const [stats, setStats] = useState({
    totalClaims: 0,
    approvedClaims: 0,
    rejectedClaims: 0,
    pendingClaims: 0,
    totalAmount: 0,
    approvedAmount: 0,
  })

  useEffect(() => {
    let claims = getClaims()

    if (personal) {
      claims = getClaimsByMemberId(user.id)
    }

    const approved = claims.filter((c) => c.status === "approved")
    const rejected = claims.filter((c) => c.status === "rejected")
    const pending = claims.filter((c) => c.status === "submitted" || c.status === "pending-approval")

    const totalAmount = claims.reduce((sum, c) => sum + Number.parseFloat(c.amount || 0), 0)
    const approvedAmount = approved.reduce((sum, c) => sum + Number.parseFloat(c.amount || 0), 0)

    setStats({
      totalClaims: claims.length,
      approvedClaims: approved.length,
      rejectedClaims: rejected.length,
      pendingClaims: pending.length,
      totalAmount,
      approvedAmount,
    })
  }, [user, personal])

  const handleExport = () => {
    // Validate data integrity before export
    if (stats.totalClaims === 0) {
      alert("No data available to export")
      return
    }

    // Check for incomplete data
    const claims = personal ? getClaimsByMemberId(user.id) : getClaims()
    const hasIncompleteData = claims.some(c => !c.amount || !c.status || !c.createdAt)

    if (hasIncompleteData) {
      const confirmExport = confirm("Some claims have incomplete data. Export anyway?")
      if (!confirmExport) return
    }

    // Show export confirmation
    const confirmMessage = `Export ${personal ? "your" : "system"} summary report with ${stats.totalClaims} claims?`
    if (!confirm(confirmMessage)) return

    // Simulate PDF export (in real implementation, would use jsPDF or similar)
    alert(`Exporting ${personal ? "personal" : "system"} summary report...`)
    // TODO: Implement actual PDF export
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{personal ? "Your Claim Summary" : "System Summary"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Total Claims</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClaims}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Approved Claims</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approvedClaims}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Pending Claims</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pendingClaims}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Rejected Claims</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rejectedClaims}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Total Amount</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₱{stats.totalAmount.toFixed(2)}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <p className="text-gray-600 text-sm font-semibold">Approved Amount</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">₱{stats.approvedAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Approval Rate</span>
            <span className="text-gray-900 font-semibold">
              {stats.totalClaims > 0 ? ((stats.approvedClaims / stats.totalClaims) * 100).toFixed(1) : 0}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Average Claim Amount</span>
            <span className="text-gray-900 font-semibold">
              ₱{stats.totalClaims > 0 ? (stats.totalAmount / stats.totalClaims).toFixed(2) : 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Rejection Rate</span>
            <span className="text-gray-900 font-semibold">
              {stats.totalClaims > 0 ? ((stats.rejectedClaims / stats.totalClaims) * 100).toFixed(1) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
