"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, getMembers, createClaim, addNotification, addAuditLog } from "@/lib/storage"
import { canCreateClaims } from "@/lib/permissions"
import AuthGuard from "@/components/auth-guard"
import ClaimModal from "@/components/modals/claim-modal"

function NewClaimContent() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [members, setMembers] = useState([])
  const [showModal, setShowModal] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setMembers(getMembers())
  }, [])

  const handleSubmit = (claimData) => {
    const newClaim = createClaim({
      ...claimData,
      createdBy: user.id,
    })
    addAuditLog("CLAIM_CREATED", `Claim ${newClaim.id.slice(-8)} submitted for approval by ${user.name}`, user.id)
    addNotification(user.id, `Claim ${newClaim.id.slice(-8)} has been submitted for approval.`, "info")
    router.push(`/dashboard/claims/${newClaim.id}`)
  }

  const handleClose = () => {
    router.back()
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <ClaimModal
      isOpen={showModal}
      onClose={handleClose}
      currentUser={user}
      onSuccess={handleSubmit}
    />
  )
}

export default function NewClaimPage() {
  return (
    <AuthGuard requireAuth={true} permissionCheck={canCreateClaims}>
      <NewClaimContent />
    </AuthGuard>
  )
}
