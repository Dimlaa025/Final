"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser, logoutUser } from "@/lib/storage"
import { canManageAnnouncements } from "@/lib/permissions"
import Navbar from "@/components/navbar"
import Sidebar from "@/components/sidebar"
import AnnouncementModal from "@/components/modals/announcement-modal"
import { getAnnouncements, deleteAnnouncement } from "@/lib/storage"
import { Megaphone, Plus, Edit, Trash2, Eye, Calendar, AlertTriangle, Info } from "lucide-react"

export default function AnnouncementsPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/login")
    } else if (!canManageAnnouncements(currentUser)) {
      router.push("/unauthorized")
    } else {
      setUser(currentUser)
      loadAnnouncements()
    }
  }, [router])

  const loadAnnouncements = () => {
    const data = getAnnouncements()
    setAnnouncements(data)
    setLoading(false)
  }

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncement(id)
      loadAnnouncements()
    }
  }

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar user={user} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">Announcements</h1>
                  <p className="text-sm sm:text-base text-gray-600 break-words">Manage system announcements</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">New Announcement</span>
              </button>
            </div>

            {/* Announcements List */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading announcements...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8 sm:py-12 px-4">
                <Megaphone className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 break-words">No announcements yet</h3>
                <p className="text-sm sm:text-base text-gray-500 break-words">Create your first announcement to get started.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getPriorityColor(announcement.priority)}`}>
                            {getPriorityIcon(announcement.priority)}
                            <span className="capitalize">{announcement.priority}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            {formatDate(announcement.createdAt)}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{announcement.title}</h3>
                        <p className="text-gray-600 mb-4">{announcement.message}</p>
                        {announcement.expiresAt && (
                          <div className="text-sm text-gray-500">
                            Expires: {formatDate(announcement.expiresAt)}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setEditingAnnouncement(announcement)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(announcement.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <AnnouncementModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            loadAnnouncements()
          }}
        />
      )}

      {/* Edit Modal */}
      {editingAnnouncement && (
        <AnnouncementModal
          isOpen={!!editingAnnouncement}
          onClose={() => {
            setEditingAnnouncement(null)
            loadAnnouncements()
          }}
          announcement={editingAnnouncement}
        />
      )}
    </div>
  )
}
