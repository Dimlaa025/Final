"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getCurrentUser, getClaimById, getMembers, updateClaim, addNotification, addAuditLog, getDependentsByMemberId } from "@/lib/storage"
import { canEditClaim, canManageClaims, canViewOwnClaims } from "@/lib/permissions"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import AuthGuard from "@/components/auth-guard"
import ClaimModal from "@/components/modals/claim-modal"

function EditClaimContent() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState(null)
  const [claim, setClaim] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
    } else {
      setUser(currentUser)
      const claimData = getClaimById(params.id)
      if (claimData) {
        // Check if user can edit this claim
        if (!canEditClaim(currentUser, claimData)) {
          router.push("/unauthorized")
          return
        }
        setClaim(claimData)
      } else {
        router.push("/dashboard/claims")
        return
      }
      setMembers(getMembers())
      setLoading(false)
    }
  }, [params.id, router])

  const handleSubmit = (claimData) => {
    const updatedClaim = updateClaim(claim.id, claimData)
    addAuditLog("CLAIM_EDITED", `Claim ${claim.id.slice(-8)} edited by ${user.name}`, user.id)
    addNotification(user.id, `Claim ${claim.id.slice(-8)} updated successfully`, "success")
    router.push(`/dashboard/claims/${claim.id}`)
  }

  const handleClose = () => {
    router.back()
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
    <ClaimModal
      isOpen={showModal}
      onClose={handleClose}
      currentUser={user}
      onSuccess={handleSubmit}
      isEdit={true}
      existingClaim={claim}
    />
  )
}

export default function EditClaimPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={(user) => canManageClaims(user) || canViewOwnClaims(user)}>
      <EditClaimContent />
    </AuthGuard>
  )
}
