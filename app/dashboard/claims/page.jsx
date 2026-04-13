"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  getCurrentUser,
  getMembers,
  getClaims,
  getDependentsByMemberId,
  logoutUser,
  searchClaims
} from "@/lib/storage"
import {
  canCreateClaims,
  canManageClaims,
  canViewAllClaims,
  canViewOwnClaims,
  canCreateClaims as checkCreatePermission
} from "@/lib/permissions"
import { Eye, Plus } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"

function ClaimsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filteredClaims, setFilteredClaims] = useState([])
  const [members, setMembers] = useState([])
  
  // Stats state for the summary cards
  const [stats, setStats] = useState({ total: 0, approved: 0, rejected: 0, pending: 0 })

  const loadData = useCallback(() => {
    const allClaims = getClaims()
    const allMembers = getMembers()
    const currentUser = getCurrentUser()
    
    setMembers(allMembers)
    setUser(currentUser)

    if (!currentUser) return

    let userClaims = []

    // 1. Get claims based on permissions
    if (canViewAllClaims(currentUser)) {
      userClaims = allClaims
    } else if (canViewOwnClaims(currentUser)) {
      const myMemberRecord = allMembers.find(m => 
        m.userId === currentUser.id || 
        m.id === currentUser.id ||
        m.name === currentUser.name
      )
      
      const myMemberId = myMemberRecord ? myMemberRecord.id : currentUser.id
      const memberDependents = getDependentsByMemberId(myMemberId)
      const dependentIds = memberDependents.map((d) => d.id)

      userClaims = allClaims.filter((c) => 
        c.memberId === myMemberId || 
        c.memberId === currentUser.id ||
        dependentIds.includes(c.memberId)
      )
    }

    // --- FIX: DEDUPLICATION FOR BOTH TABLE AND STATS ---
    // This creates a unique list using the claim ID as the key
    const uniqueClaims = Array.from(
      new Map(userClaims.map(item => [item.id, item])).values()
    )

    // 2. Update Stats (This fixes the "doubling" in dashboard cards)
    setStats({
      total: uniqueClaims.length,
      approved: uniqueClaims.filter(c => c.status === "approved").length,
      rejected: uniqueClaims.filter(c => c.status === "rejected").length,
      pending: uniqueClaims.filter(c => ["submitted", "pending-approval"].includes(c.status)).length
    })

    setFilteredClaims(uniqueClaims)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId)
    return member ? member.name : "Member"
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-gray-200 text-gray-700",
      submitted: "bg-[#FFF6B7]/60 text-yellow-900",
      "pending-approval": "bg-[#FFF6B7]/60 text-yellow-900",
      approved: "bg-[#C5EBAA]/60 text-green-900",
      rejected: "bg-[#F8C8C8]/60 text-red-900",
      voided: "bg-gray-300 text-gray-500",
    }
    return colors[status] || "bg-gray-200 text-gray-700"
  }

  if (!user) return null

  const readOnlyView = canViewOwnClaims(user) && !canManageClaims(user)

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar user={user} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={() => { logoutUser(); router.push("/login"); }} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Summary Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Total Claims</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{readOnlyView ? "My Claims" : "Claims Management"}</h1>
              {checkCreatePermission(user) && (
                <Link href="/dashboard/claims/new" className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Claim
                </Link>
              )}
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-sm font-semibold">Type</th>
                    <th className="px-6 py-3 text-sm font-semibold">For</th>
                    <th className="px-6 py-3 text-sm font-semibold">Amount</th>
                    <th className="px-6 py-3 text-sm font-semibold">Status</th>
                    <th className="px-6 py-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredClaims.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No claims found.</td></tr>
                  ) : (
                    filteredClaims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{claim.claimType}</td>
                        <td className="px-6 py-4 text-sm">{getMemberName(claim.memberId)}</td>
                        <td className="px-6 py-4 text-sm font-bold">₱{claim.amount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/dashboard/claims/${claim.id}`} className="text-blue-600 hover:underline">View</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function ClaimsPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={(u) => canViewOwnClaims(u) || canViewAllClaims(u)}>
      <ClaimsContent />
    </AuthGuard>
  )
}