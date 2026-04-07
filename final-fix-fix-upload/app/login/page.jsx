"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginUser, initializeStorage, addAuditLog } from "@/lib/storage"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    initializeStorage()
    const result = loginUser(email, password)

    if (result && !result.error) {
      router.push("/dashboard")
    } else {
      addAuditLog("LOGIN_FAILED", `Failed login attempt for email: ${email}`, "system")
      setError(result?.error || "Invalid email or password")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-7xl bg-white rounded-[28px] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[820px]">
        {/* Left Side - Branding */}
        <div className="relative bg-green-800 p-10 md:p-12 lg:p-16 flex flex-col justify-between overflow-hidden">
          {/* Soft background circles */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-8 left-8 w-28 h-28 bg-green-200 rounded-full"></div>
            <div className="absolute bottom-12 right-10 w-24 h-24 bg-yellow-200 rounded-full"></div>
            <div className="absolute top-1/2 left-12 w-14 h-14 bg-green-300 rounded-full"></div>
            <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-yellow-300 rounded-full"></div>
          </div>

          {/* Logo Top */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-white text-2xl md:text-3xl font-bold leading-none">We Care</h1>
                <p className="text-green-100 text-sm mt-1">Insurance Claim Management</p>
              </div>
            </div>
          </div>

          {/* Branding Content */}
          <div className="relative z-10 mt-12 lg:mt-0">
            <p className="text-white text-2xl mb-4">Welcome back</p>
            <h2 className="text-white text-4xl md:text-5xl font-bold leading-tight max-w-md">
              Manage claims with clarity and care.
            </h2>
    
          </div>

          {/* Bottom text */}
          <div className="relative z-10 pt-10">
            <p className="text-green-100 text-sm">Wesleyan Care</p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex items-center justify-center p-8 md:p-12 lg:p-16">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div className="mb-1">
                <Image
                  src="/WCLogo.png"
                  alt="We Care Logo"
                  width={52}
                  height={52}
                  className="w-30 h-30 object-contain -ml-8 mt-3"
                />
              </div>

              <h2 className="text-4xl font-bold text-gray-900">Log in</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 px-4 border border-gray-200 rounded-md bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-md bg-[#007a04] text-white font-medium hover:opacity-90 transition disabled:opacity-50 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200"></div>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-xs text-gray-700 font-semibold mb-3">Demo Credentials:</p>
              <div className="space-y-2 text-xs text-gray-600">
                <p>
                  <strong>Admin:</strong> admin@wecare.com / admin123
                </p>
                <p>
                  <strong>Director:</strong> director@wecare.com / director123
                </p>
                <p>
                  <strong>Assistant:</strong> assistant@wecare.com / assistant123
                </p>
                <p>
                  <strong>Member:</strong> member@wecare.com / member123
                </p>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-green-600 hover:text-green-700 font-medium">
                Register here
              </Link>
            </p>

            <p className="text-center text-sm text-gray-600 mt-2">
              Forgot your password?{" "}
              <span className="text-red-600 font-medium">Contact your administrator</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}