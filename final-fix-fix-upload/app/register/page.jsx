"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser, initializeStorage } from "@/lib/storage"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    memberId: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    initializeStorage()

    // We remove confirmPassword from the data sent to storage
    const { confirmPassword, ...userData } = formData
    
    // Register the user as a 'Member' with 'pending' status.
    // NOTE: We do NOT call addMember() here anymore.
    const result = registerUser({ 
      ...userData, 
      role: "Member", 
      status: "pending" 
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      alert(
        "Registration successful! Your account is pending approval by an administrator. You will be notified once approved."
      )
      router.push("/login")
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center px-4 py-8 md:px-8">
      <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-sm border border-gray-100 p-8 md:p-10 lg:p-12">
        <div className="w-full max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-3">
              <Image
                src="/WCLogo.png"
                alt="We Care Logo"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
              />
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Register
            </h1>

            <p className="text-gray-500 mt-3 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              Create your member account. Your registration will be reviewed by an administrator before activation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-12 md:h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 md:h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full h-12 md:h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                  placeholder="Enter your department"
                  required
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Member ID
                </label>
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  className="w-full h-12 md:h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                  placeholder="Enter your member ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 md:h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div>
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full h-12 md:h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm md:text-base">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 md:h-14 rounded-xl bg-[#007a04] text-white font-semibold text-sm md:text-base hover:opacity-90 transition disabled:opacity-50 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
            >
              {loading ? "Creating account..." : "Register"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200"></div>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-sm md:text-base text-gray-700 font-semibold mb-3">
              Registration Notice:
            </p>
            <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
              <p>Your account will be submitted for admin approval.</p>
              <p>Please make sure your Member ID and Department are correct.</p>
              <p>You will be able to log in once your account has been approved.</p>
            </div>
          </div>

          <p className="text-center text-sm md:text-base text-gray-600 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}