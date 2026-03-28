"use client"

import { useState, useEffect } from "react"
import { addAnnouncement, updateAnnouncement } from "@/lib/storage"
import { Megaphone, Calendar, AlertTriangle, Info } from "lucide-react"

export default function AnnouncementModal({ isOpen, onClose, announcement = null }) {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "normal",
    expiresAt: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Populate form data when editing an announcement
  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        message: announcement.message || "",
        priority: announcement.priority || "normal",
        expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().slice(0, 16) : "",
      })
    } else {
      setFormData({
        title: "",
        message: "",
        priority: "normal",
        expiresAt: "",
      })
    }
  }, [announcement, isOpen])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.title.trim() || !formData.message.trim()) {
        setError("Title and message are required")
        setLoading(false)
        return
      }

      // Validate expiration date if provided
      if (formData.expiresAt && new Date(formData.expiresAt) <= new Date()) {
        setError("Expiration date must be in the future")
        setLoading(false)
        return
      }

      if (announcement) {
        // Update existing announcement
        updateAnnouncement(announcement.id, {
          title: formData.title.trim(),
          message: formData.message.trim(),
          priority: formData.priority,
          expiresAt: formData.expiresAt || null,
        })
        alert("Announcement updated successfully!")
      } else {
        // Create new announcement
        addAnnouncement(
          formData.title.trim(),
          formData.message.trim(),
          formData.priority,
          formData.expiresAt || null
        )
        alert("Announcement created successfully!")
      }

      // Reset form and close modal
      setFormData({
        title: "",
        message: "",
        priority: "normal",
        expiresAt: "",
      })
      setLoading(false)
      onClose()
    } catch (err) {
      setError("Failed to create announcement")
      setLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      normal: "text-blue-600 bg-blue-50 border-blue-200",
      important: "text-yellow-600 bg-yellow-50 border-yellow-200",
      urgent: "text-red-600 bg-red-50 border-red-200",
    }
    return colors[priority] || colors.normal
  }

  const getPriorityIcon = (priority) => {
    const icons = {
      normal: <Info className="w-4 h-4" />,
      important: <AlertTriangle className="w-4 h-4" />,
      urgent: <AlertTriangle className="w-4 h-4" />,
    }
    return icons[priority] || icons.normal
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <Megaphone className="w-6 h-6 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">{announcement ? "Edit Announcement" : "Create Announcement"}</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              placeholder="Enter announcement title"
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Enter announcement message"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {["normal", "important", "urgent"].map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 transition ${
                    formData.priority === priority
                      ? getPriorityColor(priority) + " border-current"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {getPriorityIcon(priority)}
                  <span className="text-sm font-medium capitalize">{priority}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration Date (Optional)
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                min={new Date().toISOString().slice(0, 16)}
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for no expiration
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {loading ? (announcement ? "Updating..." : "Creating...") : (announcement ? "Update Announcement" : "Create Announcement")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
