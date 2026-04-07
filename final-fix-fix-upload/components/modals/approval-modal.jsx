"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { addAuditLog, getCurrentUser } from "@/lib/storage"

export default function ApprovalModal({ claim, action, memberName, onApprove, onReject, onVoid, onClose }) {
  const [comments, setComments] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    setLoading(true)
    const currentUser = getCurrentUser()
    const userId = currentUser ? currentUser.id : "system"

    if (action === "approve") {
      onApprove(comments)
      addAuditLog("CLAIM_APPROVED", `Claim ${claim.id.slice(-8)} approved by ${currentUser?.name || 'System'} for member ${memberName} - Amount: ₱${claim.amount}, Type: ${claim.claimType}${comments ? ` - Comments: ${comments}` : ''}`, userId)
    } else if (action === "reject") {
      onReject(comments)
      addAuditLog("CLAIM_REJECTED", `Claim ${claim.id.slice(-8)} rejected by ${currentUser?.name || 'System'} for member ${memberName} - Amount: ₱${claim.amount}, Type: ${claim.claimType}${comments ? ` - Comments: ${comments}` : ''}`, userId)
    } else if (action === "void") {
      onVoid(comments)
      addAuditLog("CLAIM_VOIDED", `Claim ${claim.id.slice(-8)} voided by ${currentUser?.name || 'System'} for member ${memberName} - Amount: ₱${claim.amount}, Type: ${claim.claimType}${comments ? ` - Comments: ${comments}` : ''}`, userId)
    }
    setLoading(false)
  }

  const isApprove = action === "approve"
  const isVoid = action === "void"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 break-words">
            {isApprove ? "Approve Claim" : isVoid ? "Void Claim" : "Reject Claim"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 flex-shrink-0">
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          <div>
            <p className="text-xs sm:text-sm text-gray-600">Claim ID</p>
            <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{claim.id.slice(-8)}</p>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-gray-600">Member</p>
            <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{memberName}</p>
          </div>

          <div>
            <p className="text-xs sm:text-sm text-gray-600">Amount</p>
            <p className="text-base sm:text-lg text-gray-900 font-medium break-words">₱{claim.amount}</p>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 break-words">Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition text-sm sm:text-base"
              rows="3"
              placeholder="Add any comments or notes..."
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 px-4 rounded-lg transition text-sm sm:text-base"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 text-white font-medium py-2 px-4 rounded-lg transition text-sm sm:text-base ${
              isApprove
                ? "bg-green-500 hover:bg-green-600 disabled:opacity-50"
                : isVoid
                ? "bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                : "bg-red-500 hover:bg-red-600 disabled:opacity-50"
            }`}
          >
            {loading ? "Processing..." : isApprove ? "Approve" : isVoid ? "Void" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  )
}
