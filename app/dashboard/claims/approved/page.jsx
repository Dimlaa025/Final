"use client"

import { useState, useEffect } from 'react'
import { getCurrentUser, getClaims, getMembers } from '@/lib/storage'
import { canViewAllClaims } from '@/lib/permissions'
import AuthGuard from '@/components/auth-guard'

export default function ApprovedClaimsPage() {
  const [user, setUser] = useState(null)
  const [claims, setClaims] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    if (canViewAllClaims(currentUser)) {
      const approvedClaims = getClaims().filter(c => c.status === 'approved')
      setClaims(approvedClaims)
      setMembers(getMembers())
    }
  }, [])

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.name : 'Unknown'
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Approved Claims ({claims.length})</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead><tr><th>Status</th></tr></thead>
          <tbody>{claims.map(c => <tr key={c.id}><td>{getMemberName(c.memberId)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

