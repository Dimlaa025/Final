"use client"

import {
  Home,
  FileText,
  Users,
  User,
  UserCheck,
  BarChart3,
  Settings,
  CheckCircle,
  Megaphone,
  X,
} from "lucide-react"
import Link from "next/link"
import {
  canManageUsers,
  canManageDependents,
  canViewOwnClaims,
  canApproveClaims,
  canViewReports,
  canViewAuditLogs,
  canManageRoles,
  canManageMembers,
  canManageAnnouncements,
  canManageClaims,
  canViewAllClaims,
} from "@/lib/permissions"

export default function Sidebar({ user, isOpen, onClose }) {
  const getMenuItems = () => {
    const menuItems = []

    menuItems.push({ icon: Home, label: "Dashboard", href: "/dashboard" })

    // Users
    if (canManageUsers(user)) {
      menuItems.push({ icon: Users, label: "Users", href: "/dashboard/rbac" })
    }

    // Members
    if (canManageMembers(user) || user.role === "Director") {
      menuItems.push({ icon: User, label: "Members", href: "/dashboard/members" })
    }

    // Dependents
    if (canManageDependents(user) || user.role === "Director") {
      menuItems.push({ icon: UserCheck, label: "Dependents", href: "/dashboard/dependents" })
    }

    if (
      canManageClaims(user) ||
      canViewOwnClaims(user) ||
      canViewAllClaims(user) ||
      user.role === "Member"
    ) {
      menuItems.push({ icon: FileText, label: "Claims", href: "/dashboard/claims" })
    }

    if (canApproveClaims(user)) {
      menuItems.push({ icon: CheckCircle, label: "Approvals", href: "/dashboard/approvals" })
    }

    if (canViewReports(user)) {
      menuItems.push({ icon: BarChart3, label: "Reports", href: "/dashboard/reports" })
    }

    if (canManageAnnouncements(user)) {
      menuItems.push({ icon: Megaphone, label: "Announcements", href: "/dashboard/announcements" })
    }

    if (canViewAuditLogs(user)) {
      menuItems.push({ icon: Settings, label: "Audit Logs", href: "/dashboard/audit-logs" })
    }

    return menuItems
  }

  const menuItems = getMenuItems()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:relative top-0 left-0 h-full bg-white border-r border-gray-200 transition-transform duration-300 flex flex-col z-50
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${isOpen ? "w-full md:w-64" : "w-20"}
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h1 className={`font-bold text-green-600 ${isOpen ? "text-2xl" : "text-lg"}`}>
            {isOpen ? "We Care" : "WC"}
          </h1>

          {isOpen && (
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition text-gray-700 hover:text-green-600"
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))} 
        </nav>
      </aside>
    </>
  )
}