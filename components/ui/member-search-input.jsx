"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronDown } from "lucide-react"

export default function MemberSearchInput({ members, value, onChange, placeholder = "Search members...", required = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredMembers, setFilteredMembers] = useState([])
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)

  // Get selected member details
  const selectedMember = members.find(m => m.id === value)

  useEffect(() => {
    if (selectedMember) {
      setSearchTerm(`${selectedMember.name} - ${selectedMember.department}`)
    } else {
      setSearchTerm("")
    }
  }, [selectedMember])

  useEffect(() => {
    // Filter members based on search term
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredMembers(filtered.slice(0, 10)) // Limit to 10 results
  }, [searchTerm, members])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const term = e.target.value
    setSearchTerm(term)
    setIsOpen(true)
    if (!term) {
      onChange("")
    }
  }

  const handleMemberSelect = (member) => {
    onChange(member.id)
    setSearchTerm(`${member.name} - ${member.department}`)
    setIsOpen(false)
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    if (!searchTerm && selectedMember) {
      setSearchTerm(`${selectedMember.name} - ${selectedMember.department}`)
    }
  }

  const handleClear = () => {
    setSearchTerm("")
    onChange("")
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => handleMemberSelect(member)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900">{member.name}</div>
                <div className="text-sm text-gray-600 font-mono">{member.id}</div>
                <div className="text-xs text-gray-500">{member.email} • {member.department}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-sm">
              {searchTerm ? "No members found" : "Start typing to search members"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
