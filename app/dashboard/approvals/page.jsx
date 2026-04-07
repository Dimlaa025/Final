"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getPendingClaims, getMembers, approveClaim, rejectClaim, voidClaim, addNotification } from "@/lib/storage"
import { canApproveClaims, canVoidClaims } from "@/lib/permissions"
import { CheckCircle, XCircle } from "lucide-react"
import AuthGuard from "@/components/auth-guard"
import SearchFilterBar from "@/components/search-filter-bar"
import ApprovalModal from "@/components/modals/approval-modal"

function ApprovalsContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [claims, setClaims] = useState([])
  const [members, setMembers] = useState([])
  const [filteredClaims, setFilteredClaims] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({})
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [action, setAction] = useState(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    loadData()
  }, [])

  const loadData = () => {
    const pendingClaims = getPendingClaims()
    setClaims(pendingClaims)
    setFilteredClaims(pendingClaims)
    setMembers(getMembers())
  }

  const handleApprove = (claimId, comments) => {
    approveClaim(claimId, user.id, comments)
    addNotification(user.id, `Claim ${claimId.slice(-8)} approved`, "success")
    loadData()
    setSelectedClaim(null)
    setAction(null)
  }

  const handleReject = (claimId, comments) => {
    rejectClaim(claimId, user.id, comments)
    addNotification(user.id, `Claim ${claimId.slice(-8)} rejected`, "warning")
    loadData()
    setSelectedClaim(null)
    setAction(null)
  }

  const handleVoid = (claimId, comments) => {
    voidClaim(claimId, user.id, comments)
    addNotification(user.id, `Claim ${claimId.slice(-8)} voided`, "warning")
    loadData()
    setSelectedClaim(null)
    setAction(null)
  }

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId)
    return member ? member.name : "Unknown"
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Claim ID</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Member</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Type</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Amount</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Submitted</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {claims.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-2 sm:px-4 py-6 sm:py-8 text-center text-sm text-gray-500">
                  No pending claims to review.
                </td>
              </tr>
            ) : (
              claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50 transition">
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs font-medium text-gray-900 break-words">{claim.id.slice(-8)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-600 break-words">{getMemberName(claim.memberId)}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-600 break-words">{claim.claimType}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-900 font-medium break-words">₱{claim.amount}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs text-gray-600 break-words">{new Date(claim.createdAt).toLocaleDateString()}</td>
                  <td className="px-2 sm:px-4 py-2 sm:py-3 text-xs flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        setSelectedClaim(claim)
                        setAction("approve")
                      }}
                      className="p-1 hover:bg-green-50 rounded transition text-green-600"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClaim(claim)
                        setAction("reject")
                      }}
                      className="p-1 hover:bg-red-50 rounded transition text-red-600"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    {canVoidClaims(user) && (
                      <button
                        onClick={() => {
                          setSelectedClaim(claim)
                          setAction("void")
                        }}
                        className="p-1 hover:bg-orange-50 rounded transition text-orange-600"
                        title="Void Claim"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 sm:space-y-4">
        {claims.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 text-center text-sm text-gray-500">
            No pending claims to review.
          </div>
        ) : (
          claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Claim ID: {claim.id.slice(-8)}</p>
                    <p className="text-sm text-gray-600">Member: {getMemberName(claim.memberId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">₱{claim.amount}</p>
                    <p className="text-xs text-gray-500">{new Date(claim.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Type: {claim.claimType}</p>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => {
                        setSelectedClaim(claim)
                        setAction("approve")
                      }}
                      className="p-1 sm:p-2 hover:bg-green-50 rounded transition text-green-600"
                      title="Approve"
                    >
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClaim(claim)
                        setAction("reject")
                      }}
                      className="p-1 sm:p-2 hover:bg-red-50 rounded transition text-red-600"
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {canVoidClaims(user) && (
                      <button
                        onClick={() => {
                          setSelectedClaim(claim)
                          setAction("void")
                        }}
                        className="p-1 sm:p-2 hover:bg-orange-50 rounded transition text-orange-600"
                        title="Void Claim"
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedClaim && action && (
        <ApprovalModal
          claim={selectedClaim}
          action={action}
          memberName={getMemberName(selectedClaim.memberId)}
          onApprove={(comments) => handleApprove(selectedClaim.id, comments)}
          onReject={(comments) => handleReject(selectedClaim.id, comments)}
          onVoid={(comments) => handleVoid(selectedClaim.id, comments)}
          onClose={() => {
            setSelectedClaim(null)
            setAction(null)
          }}
        />
      )}
    </div>
  )
}

export default function ApprovalsPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={canApproveClaims}>
      <ApprovalsContent />
    </AuthGuard>
  )
}

