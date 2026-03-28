"use client"

import { useState, useEffect } from "react"
import { createClaim, updateClaim, getMemberById, getDependentsByMember, getClaims, getMembers, uploadDocument } from "@/lib/storage"
import { User, FileText, DollarSign, Calendar, MessageSquare, Users, Search, ChevronDown, Upload, X, Activity, Stethoscope } from "lucide-react"

export default function ClaimModal({ isOpen, onClose, currentUser, onSuccess, isEdit = false, existingClaim = null }) {
  const [formData, setFormData] = useState({
    memberId: currentUser?.role === "Member" ? currentUser.id : "",
    dependentId: "",
    claimType: "",
    procedure: "", // Added
    diagnosis: "", // Added
    amount: "",
    serviceDate: new Date().toISOString().split('T')[0],
    description: "",
  })

  // Dropdown history states
  // Load previously saved items from the browser's memory, or use defaults
const [procedureHistory, setProcedureHistory] = useState(() => {
  const saved = localStorage.getItem("procedure_history");
  return saved ? JSON.parse(saved) : ["Consultation", "Laboratory Test", "X-Ray"];
});

const [diagnosisHistory, setDiagnosisHistory] = useState(() => {
  const saved = localStorage.getItem("diagnosis_history");
  return saved ? JSON.parse(saved) : ["Fever", "Common Cold", "Hypertension"];
});

  const [claimFor, setClaimFor] = useState("self")
  const [selectedMember, setSelectedMember] = useState(null)
  const [dependents, setDependents] = useState([])
  const [mcbBalance, setMcbBalance] = useState(150000)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showMemberSearch, setShowMemberSearch] = useState(false)
  const [memberSearchTerm, setMemberSearchTerm] = useState("")
  const [filteredMembers, setFilteredMembers] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [uploadedFile, setUploadedFile] = useState(null)
  const [fileUploading, setFileUploading] = useState(false)

  useEffect(() => {
    if (currentUser?.role === "Member") {
      const member = getMemberById(currentUser.id)
      setSelectedMember(member)
      setFormData(prev => ({ ...prev, memberId: currentUser.id }))
    }
    setAllMembers(getMembers())

    if (isEdit && existingClaim) {
      const member = getMemberById(existingClaim.memberId)
      setSelectedMember(member)
      setFormData({
        memberId: existingClaim.memberId,
        dependentId: existingClaim.dependentId || "",
        claimType: existingClaim.claimType,
        procedure: existingClaim.procedure || "",
        diagnosis: existingClaim.diagnosis || "",
        amount: existingClaim.amount,
        serviceDate: existingClaim.serviceDate,
        description: existingClaim.description,
      })
      setClaimFor(existingClaim.dependentId ? "dependent" : "self")
      setMemberSearchTerm(member ? `${member.name} - ${member.department}` : "")
    }
  }, [currentUser, isEdit, existingClaim])

  useEffect(() => {
    if (formData.memberId) {
      const member = getMemberById(formData.memberId)
      setSelectedMember(member)

      if (member) {
        const memberDependents = getDependentsByMember(formData.memberId)
        setDependents(memberDependents)

        const claims = getClaims()
        const memberClaims = claims.filter(c => c.memberId === formData.memberId && c.status === "approved" && (!isEdit || c.id !== existingClaim?.id))
        const totalClaimed = memberClaims.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0)
        const MCB_LIMIT = 150000
        setMcbBalance(MCB_LIMIT - totalClaimed)
      }
    }
  }, [formData.memberId, isEdit, existingClaim])

  useEffect(() => {
    const filtered = allMembers.filter(member =>
      member.name.toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
      member.id.toLowerCase().includes(memberSearchTerm.toLowerCase())
    )
    setFilteredMembers(filtered.slice(0, 10))
  }, [memberSearchTerm, allMembers])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError("")
  }

  const handleMemberSelectFromDropdown = (member) => {
    setFormData(prev => ({ ...prev, memberId: member.id }))
    setMemberSearchTerm(`${member.name} - ${member.department}`)
    setShowMemberSearch(false)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      setUploadedFile({
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64Data: event.target.result,
      })
      setFileUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // 1. Logic to save new Procedure to the dropdown list
    if (formData.procedure && !procedureHistory.includes(formData.procedure)) {
      const updatedProcedures = [...procedureHistory, formData.procedure];
      setProcedureHistory(updatedProcedures);
      localStorage.setItem("procedure_history", JSON.stringify(updatedProcedures));
    }

    // 2. Logic to save new Diagnosis to the dropdown list
    if (formData.diagnosis && !diagnosisHistory.includes(formData.diagnosis)) {
      const updatedDiagnosis = [...diagnosisHistory, formData.diagnosis];
      setDiagnosisHistory(updatedDiagnosis);
      localStorage.setItem("diagnosis_history", JSON.stringify(updatedDiagnosis));
    }

    const claimData = {
      ...formData,
      dependentId: claimFor === "dependent" ? formData.dependentId : null,
      createdBy: currentUser.id,
      status: "submitted"
    };

    let claim = isEdit ? updateClaim(existingClaim.id, claimData) : createClaim(claimData);

    if (uploadedFile) {
      uploadDocument(claim.id, { ...uploadedFile, uploadedBy: currentUser.id });
    }

    setLoading(false);
    onSuccess && onSuccess(claim);
    onClose();
  } catch (err) {
    setError(err.message || "Failed to save claim");
    setLoading(false);
  }
};

  // --- THIS IS THE FIX ---
  // We ensure all required fields are truthy. 
  // Make sure 'memberId' is set by clicking a member in the dropdown!
  const isFormValid = 
    formData.memberId && 
    formData.claimType && 
    formData.procedure && 
    formData.diagnosis && 
    formData.amount > 0 && 
    formData.serviceDate && 
    formData.description.trim().length >= 2 && 
    uploadedFile

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-semibold text-gray-900">{isEdit ? "Edit Claim" : "Create New Claim"}</h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Member Selection Section */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Member Information</h4>
              
              {currentUser?.role === "Member" ? (
                <div className="text-sm">Logged in as: <strong>{currentUser.name}</strong></div>
              ) : (
                <div className="relative">
                  <input
                    type="text"
                    value={memberSearchTerm}
                    onChange={(e) => { setMemberSearchTerm(e.target.value); setShowMemberSearch(true); }}
                    onFocus={() => setShowMemberSearch(true)}
                    placeholder="Search and select a member..."
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  {showMemberSearch && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredMembers.map(m => (
                        <div key={m.id} onClick={() => handleMemberSelectFromDropdown(m)} className="px-4 py-2 hover:bg-green-50 cursor-pointer border-b">
                          {m.name} ({m.id})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-2 text-sm text-green-600 font-bold">Available MCB: ₱{mcbBalance.toFixed(2)}</div>
            </div>

            {/* Claim For Toggle */}
            <div className="flex gap-4">
              <button type="button" onClick={() => setClaimFor("self")} className={`flex-1 py-2 rounded-lg border-2 transition ${claimFor === "self" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300"}`}>Self</button>
              <button type="button" onClick={() => setClaimFor("dependent")} className={`flex-1 py-2 rounded-lg border-2 transition ${claimFor === "dependent" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300"}`}>Dependent</button>
            </div>

            {/* Claim Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Claim Type *</label>
                  <select name="claimType" value={formData.claimType} onChange={handleChange} className="w-full p-2 border rounded-lg">
                    <option value="">Select...</option>
                    <option value="Inpatient">Inpatient</option>
                    <option value="Outpatient">Outpatient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Amount *</label>
                  <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full p-2 border rounded-lg" placeholder="0.00" />
                </div>
              </div>

              {/* Procedure & Diagnosis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Procedure *</label>
                  <input list="procs" name="procedure" value={formData.procedure} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                  <datalist id="procs">
                    {procedureHistory.map((h, i) => <option key={i} value={h} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Diagnosis *</label>
                  <input list="diags" name="diagnosis" value={formData.diagnosis} onChange={handleChange} className="w-full p-2 border rounded-lg" />
                  <datalist id="diags">
                    {diagnosisHistory.map((h, i) => <option key={i} value={h} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Service *</label>
                <input type="date" name="serviceDate" value={formData.serviceDate} onChange={handleChange} className="w-full p-2 border rounded-lg" />
              </div>

              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded-lg w-full" rows="3" placeholder="Description..."></textarea>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed p-4 rounded-lg text-center bg-gray-50">
              {!uploadedFile ? (
                <label className="cursor-pointer">
                  <Upload className="mx-auto text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Click to upload document</span>
                  <input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.jpg,.png" />
                </label>
              ) : (
                <div className="flex justify-between items-center text-sm bg-green-50 p-2 rounded">
                  <span className="truncate">{uploadedFile.fileName}</span>
                  <X className="w-4 h-4 text-red-500 cursor-pointer" onClick={() => setUploadedFile(null)} />
                </div>
              )}
            </div>

            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600">Cancel</button>
              <button 
                type="submit" 
                disabled={!isFormValid || loading} 
                className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? "Saving..." : "Submit Claim"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}