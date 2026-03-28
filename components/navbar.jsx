"use client"


import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, Bell, Key, LogOut } from "lucide-react"
import { getNotifications, logoutUser } from "@/lib/storage"
import NotificationsPanel from "./notifications-panel"
import ChangePasswordModal from "./change-password-modal"

export default function Navbar({ user, onMenuClick }) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    logoutUser()
    router.push("/login")
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const notifications = getNotifications(user.id)
      const unread = notifications.filter((n) => !n.read).length
      setUnreadCount(unread)
    }, 1000)

    return () => clearInterval(interval)
  }, [user.id])

  return (
    <>
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button onClick={onMenuClick} className="p-2 hover:bg-gray-100 rounded-lg transition">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowChangePassword(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="Change Password"
          >
            <Key className="w-6 h-6 text-gray-700" />
          </button>

          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg transition relative"
          >
            <Bell className="w-6 h-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-6 h-6 text-gray-700 hover:text-red-600" />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </div>
      </nav>

      <NotificationsPanel userId={user.id} isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
      <ChangePasswordModal
        user={user}
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  )
}
