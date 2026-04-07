"use client"

import { useEffect, useState } from "react"
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, getAnnouncements } from "@/lib/storage"
import { X, Bell, Megaphone } from "lucide-react"

export default function NotificationsPanel({ userId, isOpen, onClose }) {
  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    if (isOpen) {
      loadNotifications()
      loadAnnouncements()
    }
  }, [isOpen, userId])

  const loadNotifications = () => {
    const notifs = getNotifications(userId)
    setNotifications(notifs.reverse())
  }

  const loadAnnouncements = () => {
    const anns = getAnnouncements()
    // Filter out expired announcements
    const activeAnnouncements = anns.filter(ann => !ann.expiresAt || new Date(ann.expiresAt) > new Date())
    setAnnouncements(activeAnnouncements.reverse())
  }

  const handleMarkAsRead = (notificationId) => {
    markNotificationAsRead(notificationId)
    loadNotifications()
  }

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(userId)
    loadNotifications()
  }

  const getNotificationColor = (type) => {
    const colors = {
      success: "bg-[#C5EBAA]/60 border-green-200 text-green-900",
      warning: "bg-[#FFF6B7]/60 border-yellow-200 text-yellow-900",
      error: "bg-[#F8C8C8]/60 border-red-200 text-red-900",
      info: "bg-blue-50 border-blue-200 text-blue-800",
    }
    return colors[type] || colors.info
  }

  const getNotificationIcon = (type) => {
    const icons = {
      success: "✓",
      warning: "⚠",
      error: "✕",
      info: "ℹ",
    }
    return icons[type] || "ℹ"
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-lg z-50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Mark All as Read
              </button>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Announcements Section */}
          {announcements.length > 0 && (
            <div className="border-b border-gray-200">
              <div className="p-4 bg-green-50 border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <Megaphone className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-green-800">Announcements</h3>
                </div>
                <div className="space-y-3">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="bg-white rounded-lg p-3 border border-green-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{ann.title}</p>
                          <p className="text-sm text-gray-700 mt-1">{ann.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              ann.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              ann.priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {ann.priority}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(ann.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Section */}
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 border-l-4 ${getNotificationColor(notif.type)} ${notif.read ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold">{getNotificationIcon(notif.type)}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{notif.message}</p>
                          <p className="text-xs text-gray-600 mt-1">{new Date(notif.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="text-xs px-3 py-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700 hover:text-gray-900"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
