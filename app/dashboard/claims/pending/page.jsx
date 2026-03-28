"use client"

import { useEffect, useState } from 'react'
import { getCurrentUser, getClaims, getMembers } from '@/lib/storage'
import { canViewAllClaims } from '@/lib/permissions'
import AuthGuard from '@/components/auth-guard'
import SearchFilterBar from '@/components/search-filter-bar'

export default function PendingClaimsPage() {
  const [user, setUser] = useState(null)
  const [claims, setClaims] = useState([])
  const [members, setMembers] = useState([])
  const [filteredClaims, setFilteredClaims] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ status: ['submitted', 'pending-approval'] })

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    if (canViewAllClaims(currentUser)) {
      const allClaims = getClaims()
      const pendingClaims = allClaims.filter(c => c.status === 'submitted' || c.status === 'pending-approval')
      setClaims(pendingClaims)
      setFilteredClaims(pendingClaims)
      setMembers(getMembers())
    }
  }, [])

  const handleSearch = (term) => {
    setSearchTerm(term)
    // Re-filter pending claims
    const results = claims.filter(c => 
      c.status === 'submitted' || c.status === 'pending-approval'
    )
    setFilteredClaims(results)
  }

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.name : 'Unknown'
  }

  const pendingClaims = claims.filter(c => c.status === 'submitted' || c.status === 'pending-approval')

  return (
    <div className=\"p-6\">
      <h1 className=\"text-3xl font-bold mb-6\">Pending Claims ({pendingClaims.length})</h1>
      <SearchFilterBar onSearch={handleSearch} onFilterChange={setFilters} />
      {/* Table with pending claims */}
      <div className=\"bg-white rounded-lg shadow overflow-hidden mt-6\">
        <table className=\"w-full\">
          {/* Same table structure as claims/page.jsx */}
        </table>
      </div>
    </div>
  )
}
