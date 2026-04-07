"use client"

import { useEffect, useState } from "react"
import { getClaims, getMembers } from "@/lib/storage"

export default function ClaimsReport({ user }) {
  const [claims, setClaims] = useState([])
  const [members, setMembers] = useState([])
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const allClaims = getClaims()
    const allMembers = getMembers()
    setMembers(allMembers)

    setClaims(allClaims)
  }, [user])

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId)
    return member ? member.name : "Unknown"
  }

  const filteredClaims = filter === "all" ? claims : claims.filter((c) => c.status === filter)

  const totalAmount = filteredClaims.reduce((sum, c) => sum + Number.parseFloat(c.amount || 0), 0)
  const avgAmount = filteredClaims.length > 0 ? totalAmount / filteredClaims.length : 0

  const handleExport = () => {
    // Validate data integrity before export
    if (filteredClaims.length === 0) {
      alert("No data available to export")
      return
    }

    // Check for incomplete data
    const hasIncompleteData = filteredClaims.some(c => !c.amount || !c.status || !c.createdAt || !c.memberId)

    if (hasIncompleteData) {
      const confirmExport = confirm("Some claims have incomplete data. Export anyway?")
      if (!confirmExport) return
    }

    // Show export confirmation
    const confirmMessage = `Export claims report with ${filteredClaims.length} claims (filter: ${filter})?`
    if (!confirm(confirmMessage)) return

    // Simulate PDF export (in real implementation, would use jsPDF or similar)
    alert(`Exporting claims report...`)
    // TODO: Implement actual PDF export
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Claims Report</h2>

      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "all"
              ? "bg-white0 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("approved")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "approved"
              ? "bg-white0 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setFilter("rejected")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "rejected"
              ? "bg-white0 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Rejected
        </button>
        <button
          onClick={() => setFilter("submitted")}
          className={`px-4 py-2 rounded-lg transition ${
            filter === "submitted"
              ? "bg-white0 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Submitted
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-sm">Total Claims</p>
          <p className="text-2xl font-bold text-gray-900">{filteredClaims.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-sm">Total Amount</p>
          <p className="text-2xl font-bold text-gray-900">₱{totalAmount.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-gray-600 text-sm">Average Amount</p>
          <p className="text-2xl font-bold text-gray-900">₱{avgAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Claim ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Member ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Member</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Type</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Amount</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-4 text-center text-gray-500">
                  No claims found.
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{claim.id.slice(-8)}</td>
                  <td className="px-4 py-3 text-gray-900 font-mono">{claim.memberId}</td>
                  <td className="px-4 py-3 text-gray-600">{getMemberName(claim.memberId)}</td>
                  <td className="px-4 py-3 text-gray-600">{claim.claimType}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">₱{claim.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        claim.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : claim.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {claim.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(claim.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
