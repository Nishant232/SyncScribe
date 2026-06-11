import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'
import Logo from '@/components/ui/Logo'

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#070711] text-white flex">

      {/* Left panel — branding (desktop only) */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 flex-col justify-between p-10 border-r border-white/[0.06] relative overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-violet-600/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-600/15 rounded-full blur-[60px] pointer-events-none" />

        <Link href="/" className="flex items-center gap-2.5 relative z-10">
          <Logo className="w-8 h-8" gradientId="signup-brand-logo" />
          <span className="text-lg font-bold font-display">SyncScribe</span>
        </Link>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '⚡', text: 'Live cursors — see your team type in real time' },
            { icon: '☁️', text: 'Auto-save keeps your work safe, always' },
            { icon: '🔗', text: 'Share with a link — no sign-up needed for guests' },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-xl leading-none mt-0.5">{item.icon}</span>
              <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-700 relative z-10">© 2024 SyncScribe</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
          <Logo className="w-8 h-8" gradientId="signup-mobile-logo" />
          <span className="text-lg font-bold font-display">SyncScribe</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-display mb-2">Create your account</h1>
            <p className="text-sm text-gray-500">
              Free forever. No credit card required.
            </p>
          </div>

          <AuthForm type="signup" />

          <p className="text-xs text-gray-600 text-center mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
