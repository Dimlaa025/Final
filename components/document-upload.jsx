"use client"

import { useState } from "react"
import { Upload, X, FileText, Download } from "lucide-react"
import { uploadDocument, deleteDocument, getDocumentsByClaim, addAuditLog, addNotification } from "@/lib/storage"
import { canManageDocuments, canViewAllClaims, canViewOwnClaims } from "@/lib/permissions"

export default function DocumentUpload({ claimId, currentUser, claim, onDocumentsChange }) {
  const [documents, setDocuments] = useState(getDocumentsByClaim(claimId))
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const canUpload = canManageDocuments(currentUser) && (claim.status === "draft" || claim.status === "submitted" || claim.status === "approved")

  const canView = canViewAllClaims(currentUser) || (canViewOwnClaims(currentUser) && claim.memberId === currentUser.id)

  const canDelete = canManageDocuments(currentUser)

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPG, and PNG files are allowed")
      return
    }

    if (file.size > maxSize) {
      setError("File size must be less than 5MB")
      return
    }

    setUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64Data = event.target.result
        const newDoc = uploadDocument(claimId, {
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          base64Data,
          uploadedBy: currentUser.id,
        })

        setDocuments([...documents, newDoc])
        addAuditLog("DOCUMENT_UPLOADED", `Document ${file.name} uploaded to claim ${claimId.slice(-8)}`, currentUser.id)
        addNotification(currentUser.id, `Document ${file.name} uploaded successfully`, "success")
        onDocumentsChange?.()
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError("Failed to upload document")
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = (doc) => {
    const link = document.createElement("a")
    link.href = doc.base64Data
    link.download = doc.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addAuditLog(
      "DOCUMENT_DOWNLOADED",
      `Document ${doc.fileName} downloaded from claim ${claimId.slice(-8)}`,
      currentUser.id,
    )
  }

  const handleDelete = (docId, fileName) => {
    if (confirm(`Delete document "${fileName}"?`)) {
      deleteDocument(docId)
      setDocuments(documents.filter((d) => d.id !== docId))
      addAuditLog("DOCUMENT_DELETED", `Document ${fileName} deleted from claim ${claimId.slice(-8)}`, currentUser.id)
      addNotification(currentUser.id, `Document ${fileName} deleted`, "info")
      onDocumentsChange?.()
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-8 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>

      {canUpload && (
        <div className="mb-6 p-4 border-2 border-dashed border-green-300 rounded-lg bg-green-50">
          <label className="flex items-center justify-center cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                {uploading ? "Uploading..." : "Click to upload or drag and drop"}
              </span>
              <span className="text-xs text-green-600">PDF, JPG, PNG up to 5MB</span>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".pdf,.jpg,.jpeg,.png"
            />
          </label>
        </div>
      )}

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">{error}</div>}

      {documents.length === 0 ? (
        <p className="text-gray-600 text-sm">No documents uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center gap-3 flex-1">
                <FileText className="w-5 h-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                  <p className="text-xs text-gray-600">
                    {(doc.fileSize / 1024).toFixed(2)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {canView && (
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDelete(doc.id, doc.fileName)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
