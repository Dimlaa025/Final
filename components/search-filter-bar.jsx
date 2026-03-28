"use client"

import { useState, useEffect } from "react"
import { Search, X, Filter } from "lucide-react"
import { saveFilterState, getFilterState } from "@/lib/storage"

export default function SearchFilterBar({ onSearch, onFilterChange, showFilters = true }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState(getFilterState())

  useEffect(() => {
    // Restore search term from localStorage on component mount
    const savedFilters = getFilterState()
    if (savedFilters.searchTerm) {
      setSearchTerm(savedFilters.searchTerm)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm)
      // Save search term to localStorage
      const currentFilters = getFilterState()
      saveFilterState({ ...currentFilters, searchTerm })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    saveFilterState(newFilters)
    onFilterChange(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
    setSearchTerm("")
    saveFilterState({})
    onSearch("")
    onFilterChange({})
  }

  const hasActiveFilters = Object.keys(filters).some((key) => filters[key])

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search claims, members, or users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        {showFilters && (
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              showAdvanced
                ? "bg-green-100 text-green-700"
                : hasActiveFilters
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Status Tabs */}
            <div className="col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
              <div className="space-y-1.5">
                {[
                  { value: '', label: 'All Claims' },
                  { value: 'submitted,pending-approval', label: 'Pending Claims' },
                  { value: 'approved', label: 'Approved Claims' },
                  { value: 'rejected', label: 'Rejected Claims' },
                  { value: 'voided', label: 'Voided Claims' }
                ].map(({ value, label }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <input
                      id={`status-${value}`}
                      type="checkbox"
                      checked={filters.status?.includes(value.split(',')[0]) || !value}
                      onChange={(e) => {
                        let newStatus = [...(filters.status || [])]
                        if (!value || e.target.checked) {
                          newStatus = value ? [value.split(',')[0]] : []
                        } else {
                          newStatus = newStatus.filter(s => !value.split(',').includes(s))
                        }
                        handleFilterChange('status', newStatus)
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`status-${value}`} className="text-sm font-medium text-gray-700 cursor-pointer hover:text-green-600">
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Claim Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Claim Type</label>
              <select
                multiple
                value={filters.claimType || []}
                onChange={(e) =>
                  handleFilterChange(
                    "claimType",
                    Array.from(e.target.selectedOptions, (option) => option.value),
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Inpatient">Inpatient</option>
                <option value="Outpatient">Outpatient</option>
                <option value="Dental">Dental</option>
                <option value="Vision">Vision</option>
              </select>
            </div>

            {/* Date Range */}
            {/* Quick Date Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Date Range</label>
              <div className="space-y-1.5">
                {['Today', 'This Week', 'This Month', 'This Year'].map(period => (
                  <div key={period} className="flex items-center space-x-2">
                    <input
                      id={`period-${period}`}
                      type="checkbox"
                      checked={filters.datePeriod === period}
                      onChange={(e) => handleFilterChange('datePeriod', e.target.checked ? period : '')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`period-${period}`} className="text-xs font-medium text-gray-700 cursor-pointer hover:text-blue-600">
                      {period}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Amount Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount (₱)</label>
              <input
                type="number"
                value={filters.minAmount || ""}
                onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Amount (₱)</label>
              <input
                type="number"
                value={filters.maxAmount || ""}
                onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                placeholder="999999"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button onClick={handleClearFilters} className="text-sm text-red-600 hover:text-red-700 font-medium">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
