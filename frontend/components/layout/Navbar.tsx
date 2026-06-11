'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Logo from '@/components/ui/Logo'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = userEmail?.substring(0, 2).toUpperCase() ?? 'U'

  return (
    <nav className="border-b border-white/[0.06] bg-[#070711]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Logo className="w-8 h-8" gradientId="navbar-logo" />
          <span className="text-lg font-bold font-display tracking-tight text-white">
            SyncScribe
          </span>
        </Link>

        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md shadow-violet-500/20">
              {initials}
            </div>
            <span className="hidden md:inline text-sm text-gray-400">
              {userEmail}
            </span>
            <svg className="w-3.5 h-3.5 text-gray-600 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#0F0F1E] rounded-2xl shadow-2xl border border-white/[0.08] z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">My Account</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{userEmail}</p>
                </div>
                <div className="p-1">
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <div className="my-1 border-t border-white/[0.06]" />
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
