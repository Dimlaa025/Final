 "use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getMembers, deleteClaim, searchClaims, getDependentsByMemberId } from "@/lib/storage"
import { canCreateClaims, canEditClaim, canManageClaims, canViewAllClaims, canViewOwnClaims, canViewMemberDetails } from "@/lib/permissions"
import { Eye, Pencil, Plus, Trash2, Users } from "lucide-react"
import Link from "next/link"
import SearchFilterBar from "@/components/search-filter-bar"
import AuthGuard from "@/components/auth-guard"
import { getClaims, getDependents, getMemberMCBUsed } from "@/lib/storage"

function ClaimsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [claims, setClaims] = useState([])
  const [filteredClaims, setFilteredClaims] = useState([])
  const [members, setMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({})

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    loadData()
  }, [])

  const loadData = () => {
    const allClaims = getClaims()
    const allMembers = getMembers()
    setMembers(allMembers)

    const currentUser = getCurrentUser()
    let userClaims = allClaims

    if (currentUser && canViewOwnClaims(currentUser) && !canViewAllClaims(currentUser)) {
      // Users with only view_own permission can only see their own claims and dependents' claims
      const memberDependents = getDependentsByMemberId(currentUser.id)
      const dependentIds = memberDependents.map(d => d.id)
      userClaims = allClaims.filter((c) =>
        c.memberId === currentUser.id || dependentIds.includes(c.memberId)
      )
    } else if (canViewAllClaims(currentUser)) {
      // Users with view_all permission can see all claims
      userClaims = allClaims
    } else {
      // Fallback for any other roles
      userClaims = []
    }

    setClaims(userClaims)
    applySearchAndFilters(userClaims, searchTerm, filters)
  }

  const applySearchAndFilters = (claimsToFilter, search, filterObj) => {
    const results = searchClaims(search, filterObj)

    // Apply permission-based filtering
    const currentUser = getCurrentUser()
    let roleFiltered = results

    if (currentUser && canViewOwnClaims(currentUser) && !canViewAllClaims(currentUser)) {
      // Users with only view_own permission can only see their own claims
      roleFiltered = results.filter((c) => c.memberId === currentUser.id)
    } else if (canViewAllClaims(currentUser)) {
      // Users with view_all permission can see all claims
      roleFiltered = results
    } else {
      // Fallback for any other roles
      roleFiltered = []
    }

    // Remove duplicates based on claim ID to ensure unique keys
    const uniqueClaims = roleFiltered.filter((claim, index, self) =>
      index === self.findIndex((c) => c.id === claim.id)
    )

    setFilteredClaims(uniqueClaims)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    applySearchAndFilters(claims, term, filters)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    applySearchAndFilters(claims, searchTerm, newFilters)
  }

  const handleDeleteClaim = (claimId) => {
    if (confirm("Are you sure you want to delete this claim?")) {
      deleteClaim(claimId)
      loadData()
    }
  }

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId)
    return member ? member.name : "Unknown"
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (canViewOwnClaims(user) && !canManageClaims(user)) {
    // Read-only claims view for users who can only view their own claims
    return (
      <div className="p-4 sm:p-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Claims</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">View your insurance claims</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">For</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Updated</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClaims.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No claims found. Create your first claim to get started.
                  </td>
                </tr>
              ) : (
                filteredClaims.map((claim) => (
                  <tr key={claim.id} className={`${claim.status === 'voided' ? 'opacity-60' : ''} hover:bg-gray-50 transition`}>
                    <td className="px-6 py-4 text-sm text-gray-600">{claim.claimType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {claim.memberId === user.id ? "Self" : getMemberName(claim.memberId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">₱{claim.amount}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}
                      >
                        {claim.status.replace("-", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(claim.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(claim.updatedAt || claim.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/dashboard/claims/${claim.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // Admin/Director/Assistant view
  return (
    <div className="p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Claims Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage insurance claims</p>
        </div>
        {canCreateClaims(user) && (
          <Link
            href="/dashboard/claims/new"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg transition text-sm sm:text-base whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            New Claim
          </Link>
        )}
      </div>

      <SearchFilterBar onSearch={handleSearch} onFilterChange={handleFilterChange} showFilters={true} />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Claim ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Member ID</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Member</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Last Updated</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                  No claims found.
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim) => (
                <tr key={claim.id} className={`${claim.status === 'voided' ? 'opacity-60' : ''} hover:bg-gray-50 transition`}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{claim.id.slice(-8)}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{claim.memberId}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{getMemberName(claim.memberId)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{claim.claimType}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">₱{claim.amount}</td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}
                    >
                      {claim.status.replace("-", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(claim.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(claim.updatedAt || claim.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm flex items-center gap-2">
                    <Link
                      href={`/dashboard/claims/${claim.id}`}
                      className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {canEditClaim(user, claim) && claim.status !== 'voided' && (
                      <Link
                        href={`/dashboard/claims/${claim.id}/edit`}
                        className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                    )}
                    {canManageClaims(user) && claim.status === "draft" && (
                      <button
                        onClick={() => handleDeleteClaim(claim.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ClaimsPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={(user) => canManageClaims(user) || canViewOwnClaims(user) || canViewAllClaims(user)}>
      <ClaimsContent />
    </AuthGuard>
  )
}
