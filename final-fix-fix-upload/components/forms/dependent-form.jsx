"use client"

import { useState, useEffect } from "react"
import MemberSearchInput from "@/components/ui/member-search-input"

export default function DependentForm({ dependent, members, onSubmit, onCancel, currentUser }) {
  const [formData, setFormData] = useState({
    name: "",
    memberId: "",
    relationship: "Spouse",
    dateOfBirth: "",
    email: "",
  })

  useEffect(() => {
    if (dependent) {
      setFormData(dependent)
    } else if (currentUser?.role === "Member") {
      // For Members, pre-fill memberId
      setFormData(prev => ({ ...prev, memberId: currentUser.id }))
    }
  }, [dependent, currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.name || formData.name.trim().length < 2) {
      alert("Please enter a valid full name (at least 2 characters)")
      return
    }
    if (!formData.memberId) {
      alert("Please select a member")
      return
    }
    if (!formData.relationship) {
      alert("Please select a relationship")
      return
    }
    if (!formData.dateOfBirth) {
      alert("Please enter date of birth")
      return
    }

    // Validate date of birth is not in the future
    const dob = new Date(formData.dateOfBirth)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (dob > today) {
      alert("Date of birth cannot be in the future")
      return
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert("Please enter a valid email address")
      return
    }

    onSubmit(formData)
    setFormData({
      name: "",
      memberId: "",
      relationship: "Spouse",
      dateOfBirth: "",
      email: "",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{dependent ? "Edit Dependent" : "Add New Dependent"}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            required
          />
        </div>

        {currentUser?.role !== "Member" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
            <MemberSearchInput
              members={members}
              value={formData.memberId}
              onChange={(memberId) => setFormData(prev => ({ ...prev, memberId }))}
              placeholder="Search and select a member..."
              required
            />
          </div>
        )}
        {currentUser?.role === "Member" && (
          <div className="md:col-span-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Adding dependent for: <span className="font-medium text-gray-900">{currentUser.name}</span>
              <span className="ml-2 font-mono text-gray-600">({currentUser.id})</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
          <select
            name="relationship"
            value={formData.relationship}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          >
            <option>Spouse</option>
            <option>Child</option>
            <option>Parent</option>
            <option>Sibling</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 rounded-lg transition"
        >
          {dependent ? "Update Dependent" : "Add Dependent"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
