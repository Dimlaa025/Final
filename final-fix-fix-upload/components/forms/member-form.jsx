"use client"

import { useState, useEffect } from "react"

export default function MemberForm({ member, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    id: "", // Important for matching storage.js records
    userId: "", // Links this member record to a login account
    name: "",
    email: "",
    phone: "",
    department: "",
    dateOfBirth: "",
    address: "",
    status: "active",
    mcbUsed: 0
  })

  useEffect(() => {
    if (member) {
      setFormData({
        id: member.id || "",
        userId: member.userId || "",
        name: member.name || "",
        email: member.email || "",
        phone: member.phone || "",
        department: member.department || "",
        dateOfBirth: member.dateOfBirth || "",
        address: member.address || "",
        status: member.status || "active",
        mcbUsed: member.mcbUsed || 0
      })
    } else {
      setFormData({
        id: `member-${Date.now()}`, // Generate unique ID for new members
        userId: "", 
        name: "",
        email: "",
        phone: "",
        department: "",
        dateOfBirth: "",
        address: "",
        status: "active",
        mcbUsed: 0
      })
    }
  }, [member])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Ensure numeric fields are correctly typed
    const submissionData = {
      ...formData,
      mcbUsed: Number(formData.mcbUsed)
    }

    onSubmit(submissionData)
    
    // Trigger a refresh event for the dashboard in case it's visible
    window.dispatchEvent(new Event("claim-updated"))
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          {member ? "Edit Member Details" : "Register New Member"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              required
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="0912 345 6789"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            />
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Home Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
          >
            {member ? "Save Changes" : "Create Member Record"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}