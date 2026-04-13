"use client"

import {
  Home, FileText, Users, User, UserCheck, 
  BarChart3, Settings, CheckCircle, Megaphone, X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  canManageUsers, canManageDependents, canViewOwnClaims,
  canApproveClaims, canViewReports, canViewAuditLogs,
  canManageMembers, canManageAnnouncements, canManageClaims, canViewAllClaims,
} from "@/lib/permissions"

export default function Sidebar({ user, isOpen, onClose }) {
  const pathname = usePathname()

  const getMenuItems = () => {
    const items = []
    if (!user) return items

    items.push({ icon: Home, label: "Dashboard", href: "/dashboard" })
    if (canManageUsers(user)) items.push({ icon: Users, label: "Users", href: "/dashboard/rbac" })
    if (canManageMembers(user) || user.role === "Director") items.push({ icon: UserCheck, label: "Members", href: "/dashboard/members" })
    if (canManageDependents(user) || user.role === "Director") items.push({ icon: UserCheck, label: "Dependents", href: "/dashboard/dependents" })
    
    if (canManageClaims(user) || canViewOwnClaims(user) || canViewAllClaims(user) || user.role === "Member") {
      items.push({ icon: FileText, label: "Claims", href: "/dashboard/claims" })
    }

    if (canApproveClaims(user)) items.push({ icon: CheckCircle, label: "Approvals", href: "/dashboard/approvals" })
    if (canViewReports(user)) items.push({ icon: BarChart3, label: "Reports", href: "/dashboard/reports" })
    if (canManageAnnouncements(user)) items.push({ icon: Megaphone, label: "Announcements", href: "/dashboard/announcements" })
    if (canViewAuditLogs(user)) items.push({ icon: Settings, label: "Audit Logs", href: "/dashboard/audit-logs" })

    return items
  }

  const menuItems = getMenuItems()

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          fixed md:sticky top-0 left-0 z-50 h-screen bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0 w-64 min-w-[256px]" : "-translate-x-full md:translate-x-0 md:w-20 md:min-w-[80px]"}
        `}
      >
        <div className="p-6 border-b border-gray-200 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-green-600 rounded flex-shrink-0 flex items-center justify-center text-white font-bold">W</div>
          <h1 className={`font-bold text-green-600 transition-opacity duration-300 whitespace-nowrap ${isOpen ? "opacity-100" : "opacity-0 invisible"}`}>
            We Care
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                // Only close automatically on mobile (screen width < 768px). 
                // On desktop, it stays in the current isOpen state.
                onClick={() => { if (window.innerWidth < 768) onClose() }}
                className={`
                  flex items-center gap-4 px-3 py-3 rounded-lg transition group
                  ${isActive 
                    ? "bg-green-50 text-green-600" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-green-600"}
                `}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-green-600" : ""}`} />
                <span className={`
                  text-sm font-medium transition-all duration-300 whitespace-nowrap
                  ${isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden md:hidden"}
                `}>
                  {item.label}
                </span>
                
                {!isOpen && (
                  <div className="absolute left-20 bg-gray-900 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 hidden md:block">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}