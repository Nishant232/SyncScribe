import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'
import Logo from '@/components/ui/Logo'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070711] text-white flex">

      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col justify-between p-10 border-r border-white/[0.06] relative overflow-hidden">
        {/* Ambient orb */}
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-violet-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-600/15 rounded-full blur-[60px] pointer-events-none" />

        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <Logo className="w-8 h-8" gradientId="login-brand-logo" />
          <span className="text-lg font-bold font-display">SyncScribe</span>
        </Link>

        <div className="relative z-10">
          <div className="text-3xl text-violet-400 mb-4 font-display leading-none">&ldquo;</div>
          <p className="text-lg text-gray-200 leading-relaxed font-display font-medium mb-6">
            The best tool we&apos;ve adopted this year. Our team&apos;s writing workflow completely changed.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-sm font-bold">
              SC
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Sarah Chen</p>
              <p className="text-xs text-gray-500">Product Lead, Veritas</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-700 relative z-10">© 2024 SyncScribe</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <Logo className="w-8 h-8" gradientId="login-mobile-logo" />
          <span className="text-lg font-bold font-display">SyncScribe</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display mb-2">Welcome back</h1>
            <p className="text-sm text-gray-500">
              Sign in to continue to SyncScribe
            </p>
          </div>

          <AuthForm type="login" />

          <p className="text-xs text-gray-600 text-center mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign up for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
