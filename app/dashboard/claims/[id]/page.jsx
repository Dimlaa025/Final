"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  getCurrentUser,
  getClaimById,
  getMembers,
  updateClaim,
  addNotification,
  addAuditLog,
} from "@/lib/storage"
import { canViewOwnClaims, canManageClaims, canViewAllClaims } from "@/lib/permissions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"
import DocumentUpload from "@/components/document-upload"

function ClaimDetailContent() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState(null)
  const [claim, setClaim] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [documentsUpdated, setDocumentsUpdated] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (!currentUser) {
      router.push("/login")
    } else {
      setUser(currentUser)

      const claimData = getClaimById(params.id)

      if (claimData) {
        const canViewAll = canManageClaims(currentUser) || canViewAllClaims(currentUser)
        const canViewOwn = canViewOwnClaims(currentUser) && claimData.memberId === currentUser.id

        if (!canViewAll && !canViewOwn) {
          router.push("/unauthorized")
          return
        }

        setClaim(claimData)
      }

      setMembers(getMembers())
      setLoading(false)
    }
  }, [params.id, router, documentsUpdated])

  const handleSubmitClaim = () => {
    if (claim.status === "draft") {
      const updated = updateClaim(claim.id, { status: "submitted" })
      setClaim(updated)
      addAuditLog("CLAIM_SUBMITTED", `Claim ${claim.id.slice(-8)} submitted by ${user.name}`, user.id)
      addNotification(user.id, `Claim ${claim.id.slice(-8)} submitted for approval`, "success")
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
      voided: "bg-gray-200 text-gray-700",
    }
    return colors[status] || "bg-gray-200 text-gray-700"
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Claim not found</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <Link href="/dashboard/claims" className="flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Claims
      </Link>

      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Claim #{claim.id.slice(-8)}</h1>
            <p className="text-gray-600 mt-2">
              Created: {new Date(claim.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              Last Updated: {new Date(claim.updatedAt || claim.createdAt).toLocaleDateString()}
            </p>
          </div>

          <span
            className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(claim.status)}`}
          >
            {claim.status.replace("-", " ")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Claim Information</h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Member ID</p>
                <p className="text-gray-900 font-mono font-medium">{claim.memberId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Member</p>
                <p className="text-gray-900 font-medium">{getMemberName(claim.memberId)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Claim Type</p>
                <p className="text-gray-900 font-medium">{claim.claimType || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Procedure</p>
                <p className="text-gray-900 font-medium">{claim.procedure || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Diagnosis</p>
                <p className="text-gray-900 font-medium">{claim.diagnosis || "-"}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-gray-900 font-medium text-lg">₱{claim.amount}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Service Date</p>
                <p className="text-gray-900 font-medium">{claim.serviceDate || "-"}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed">{claim.description || "-"}</p>
          </div>
        </div>

        {claim.status === "approved" && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Approved:</strong> {new Date(claim.approvedAt).toLocaleDateString()}
            </p>
            {claim.comments && <p className="text-sm text-green-800 mt-2">{claim.comments}</p>}
          </div>
        )}

        {claim.status === "rejected" && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Rejected:</strong> {new Date(claim.rejectedAt).toLocaleDateString()}
            </p>
            {claim.comments && <p className="text-sm text-red-800 mt-2">{claim.comments}</p>}
          </div>
        )}

        {canManageClaims(user) && claim.status === "draft" && (
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleSubmitClaim}
              className="bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded-lg transition"
            >
              Submit for Approval
            </button>

            <Link
              href="/dashboard/claims"
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium px-6 py-2 rounded-lg transition"
            >
              Cancel
            </Link>
          </div>
        )}
      </div>

      {user && (
        <DocumentUpload
          claimId={claim.id}
          currentUser={user}
          claim={claim}
          onDocumentsChange={() => setDocumentsUpdated(!documentsUpdated)}
        />
      )}
    </div>
  )
}

export default function ClaimDetailPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={(user) => canViewAllClaims(user) || canViewOwnClaims(user)}>
      <ClaimDetailContent />
    </AuthGuard>
  )
}