"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MemberSearchInput from "@/components/ui/member-search-input"
import { getClaims, getMemberById } from "@/lib/storage"

export default function ClaimForm({ members, onSubmit, currentUser, initialData, isEditing = false }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    memberId: currentUser?.role === "Member" ? currentUser.id : "",
    claimType: "Medical",
    amount: "",
    serviceDate: "",
    description: "",
  })
  const [mcbBalance, setMcbBalance] = useState(150000)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        memberId: initialData.memberId,
        claimType: initialData.claimType,
        amount: initialData.amount,
        serviceDate: initialData.serviceDate,
        description: initialData.description,
      })
    }
  }, [isEditing, initialData])

  useEffect(() => {
    if (formData.memberId) {
      updateMCBBalance(formData.memberId)
    }
  }, [formData.memberId])

  const updateMCBBalance = (memberId) => {
    const claims = getClaims()
    const memberClaims = claims.filter(c => c.memberId === memberId && c.status !== "voided")
    const totalClaimed = memberClaims.reduce((sum, c) => sum + parseFloat(c.amount), 0)
    const MCB_LIMIT = 150000
    setMcbBalance(MCB_LIMIT - totalClaimed)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    // Validate required fields
    if (!formData.memberId) {
      setError("Please select a member")
      return
    }
    if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid amount greater than 0")
      return
    }
    if (!formData.serviceDate) {
      setError("Please select a service date")
      return
    }
    if (!formData.description || formData.description.trim().length < 10) {
      setError("Please provide a detailed description (at least 10 characters)")
      return
    }

    // Validate service date is not in the future
    const serviceDate = new Date(formData.serviceDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (serviceDate > today) {
      setError("Service date cannot be in the future")
      return
    }

    // Validate MCB balance
    if (parseFloat(formData.amount) > mcbBalance) {
      setError(`Claim amount exceeds member's remaining MCB balance. Available: ₱${mcbBalance.toFixed(2)}`)
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {currentUser?.role !== "Member" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Member *</label>
          <MemberSearchInput
            members={members}
            value={formData.memberId}
            onChange={(memberId) => setFormData(prev => ({ ...prev, memberId }))}
            placeholder="Search and select a member..."
          />
          {formData.memberId && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Selected Member ID: <span className="font-mono font-medium text-gray-900">{formData.memberId}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Available MCB Balance: <span className="font-medium text-green-600">₱{mcbBalance.toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>
      )}
      {currentUser?.role === "Member" && (
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-700">
            Claiming for: <span className="font-medium text-gray-900">{currentUser.name}</span>
            <span className="ml-2 font-mono text-gray-600">({currentUser.id})</span>
          </p>
          <p className="text-sm text-gray-700 mt-1">
            Available MCB Balance: <span className="font-medium text-green-600">₱{mcbBalance.toFixed(2)}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Claim Type *</label>
          <select
            name="claimType"
            value={formData.claimType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          >
            <option>Inpatient</option>
            <option>Outpatient</option>
            <option>Dental</option>
            <option>Vision</option>
            <option>Prescription</option>
            <option>Mental Health</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="0.00"
            step="0.01"
            required
          />
        </div>
      </div>

      {/* New Procedure and Diagnosis Fields */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">Procedure *</label>
    <input
      list="procedure-options"
      name="procedure"
      value={formData.procedure}
      onChange={handleChange}
      placeholder="Type or select procedure..."
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
      required
    />
    <datalist id="procedure-options">
      {procedureHistory.map((item, index) => (
        <option key={index} value={item} />
      ))}
    </datalist>
  </div>

  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis *</label>
    <input
      list="diagnosis-options"
      name="diagnosis"
      value={formData.diagnosis}
      onChange={handleChange}
      placeholder="Type or select diagnosis..."
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
      required
    />
    <datalist id="diagnosis-options">
      {diagnosisHistory.map((item, index) => (
        <option key={index} value={item} />
      ))}
    </datalist>
  </div>
</div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Service Date *</label>
        <input
          type="date"
          name="serviceDate"
          value={formData.serviceDate}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          rows="4"
          placeholder="Enter claim details..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition"
        >
          {isEditing ? "Update Claim" : "Submit Claim"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
