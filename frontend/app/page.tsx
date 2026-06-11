import Link from 'next/link'
import { ArrowRight, Zap, Users, Lock, RefreshCw, MousePointer2, Cloud } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const features = [
  {
    icon: Zap,
    title: 'Real-Time Sync',
    description: 'Every keystroke syncs instantly across all connected users. No refresh, no delay — just live updates.',
  },
  {
    icon: MousePointer2,
    title: 'Live Cursors',
    description: 'See exactly where your teammates are working with color-coded cursors and name tags.',
  },
  {
    icon: Users,
    title: 'Team Presence',
    description: 'Know who is online and active with live presence avatars and typing indicators.',
  },
  {
    icon: Cloud,
    title: 'Auto-Save',
    description: 'Never lose your work. Documents save automatically to the cloud as you type.',
  },
  {
    icon: RefreshCw,
    title: 'Instant Share',
    description: 'Share documents with a single link. Set viewer or editor access per person.',
  },
  {
    icon: Lock,
    title: 'Secure Access',
    description: 'Role-based permissions ensure your documents stay in the right hands.',
  },
]

const steps = [
  {
    title: 'Create a Document',
    description: 'Sign up in seconds and spin up your first document with a single click.',
  },
  {
    title: 'Invite Your Team',
    description: 'Share a link with teammates. They can join instantly and start collaborating.',
  },
  {
    title: 'Write Together',
    description: 'See live cursors, typing indicators, and changes appear in real time.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070711] text-white overflow-x-hidden">

      {/* ── Ambient background orbs ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-48 -right-32 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute top-1/2 -left-48 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] animate-float-delay" />
        <div className="absolute bottom-32 right-1/3 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] animate-float-slow" />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* ── Navigation ──────────────────────────────────────── */}
      <header className="relative z-50">
        <nav className="flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo className="w-9 h-9" gradientId="nav-logo" />
            <span className="text-xl font-bold font-display tracking-tight">SyncScribe</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="text-sm font-semibold bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-violet-500/30 hover:-translate-y-px"
            >
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-24 md:pt-28">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium text-violet-300 border border-violet-500/30 bg-violet-500/10 mb-8"
          style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '0ms' }}
        >
          <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-pulse-slow" />
          Real-time collaboration, reimagined
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl lg:text-[72px] font-bold font-display leading-[1.05] max-w-4xl mb-6 tracking-tight"
          style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '80ms' }}
        >
          Write Together,{' '}
          <br className="hidden md:block" />
          <span className="gradient-text">In Perfect Sync</span>
        </h1>

        <p
          className="text-lg md:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed"
          style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '160ms' }}
        >
          The collaborative document editor for modern teams. Live cursors, real-time sync,
          and instant sharing — all in your browser.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row items-center gap-3 mb-20"
          style={{ animation: 'fade-up 0.6s ease-out both', animationDelay: '240ms' }}
        >
          <Link
            href="/auth/signup"
            className="group inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-xl transition-all hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
          >
            Start Writing Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-medium text-gray-300 hover:text-white rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
          >
            Sign In
          </Link>
        </div>

        {/* ── Editor mockup ─────────────────────────────────── */}
        <div
          className="relative w-full max-w-3xl mx-auto"
          style={{ animation: 'fade-up 0.7s ease-out both', animationDelay: '340ms' }}
        >
          <div className="absolute -inset-px bg-gradient-to-b from-violet-500/40 via-blue-500/20 to-transparent rounded-2xl blur-2xl opacity-60" />

          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#0D0D1B] shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

            {/* Window chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#080812]">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Logo className="w-4 h-4" gradientId="chrome-logo" />
                <span>project-roadmap.txt — SyncScribe</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-violet-500 ring-[1.5px] ring-[#080812] flex items-center justify-center text-[8px] font-bold">A</div>
                  <div className="w-5 h-5 rounded-full bg-cyan-500 ring-[1.5px] ring-[#080812] flex items-center justify-center text-[8px] font-bold">B</div>
                </div>
                <span className="text-[10px] text-gray-600 ml-0.5">2 editing</span>
              </div>
            </div>

            {/* Editor body */}
            <div className="p-7 md:p-10 font-mono text-sm leading-relaxed text-left">
              <div className="space-y-1.5">
                <p>
                  <span className="text-violet-400"># </span>
                  <span className="text-blue-300 font-medium">Q3 Product Roadmap 2024</span>
                </p>
                <p className="text-gray-600">&nbsp;</p>
                <p>
                  <span className="text-gray-300">We&apos;re shipping </span>
                  <span className="bg-cyan-500/20 text-cyan-300 rounded-sm px-0.5">three major features</span>
                  <span className="text-gray-300"> this quarter that will</span>
                </p>
                <p className="text-gray-400">
                  significantly improve team productivity and user satisfaction.
                </p>
                <p className="text-gray-600">&nbsp;</p>
                <p className="flex items-baseline flex-wrap">
                  <span className="text-gray-400">Key priorities: real-time editing,&nbsp;</span>
                  {/* Violet cursor — Alex */}
                  <span className="relative inline-flex items-center">
                    <span className="inline-block w-[2px] h-[14px] bg-violet-400 animate-blink" />
                    <span
                      className="absolute -top-7 left-0 bg-violet-600 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg"
                      style={{ fontFamily: 'var(--font-inter)', fontWeight: 500 }}
                    >
                      Alex
                    </span>
                  </span>
                </p>
                <p>
                  <span className="text-gray-600 mr-2">—</span>
                  <span className="text-gray-400">Collaborative editing workspace</span>
                </p>
                <p className="flex items-baseline">
                  <span className="text-gray-600 mr-2">—</span>
                  <span className="text-gray-400">Live presence indicators&nbsp;</span>
                  {/* Cyan cursor — Sam */}
                  <span className="relative inline-flex items-center">
                    <span
                      className="inline-block w-[2px] h-[14px] bg-cyan-400 animate-blink"
                      style={{ animationDelay: '0.5s' }}
                    />
                    <span
                      className="absolute -top-7 left-0 bg-cyan-700 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap shadow-lg"
                      style={{ fontFamily: 'var(--font-inter)', fontWeight: 500 }}
                    >
                      Sam typing...
                    </span>
                  </span>
                </p>
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5 text-[10px]" style={{ fontFamily: 'var(--font-inter)' }}>
                <span className="text-gray-700">UTF-8 · Plain Text · Line 8</span>
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
                  Saved
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-violet-400 uppercase tracking-[0.15em] mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Everything your team needs
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm">
              Powerful enough for large teams. Simple enough for day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-violet-500/25 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/25 to-blue-500/10 border border-white/[0.06] flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2 font-display">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-24 border-t border-white/[0.05]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-[0.15em] mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold font-display">
              Up and running in{' '}
              <span className="text-cyan-400">60 seconds</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
            {steps.map((step, i) => (
              <div key={step.title} className="relative flex flex-col items-center text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+28px)] right-[-50%] h-px bg-gradient-to-r from-violet-500/40 to-transparent" />
                )}
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-lg font-bold font-display mb-5 shadow-lg shadow-violet-500/20 relative z-10">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-white mb-2 font-display">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-24">
        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-3xl p-10 md:p-14 text-center overflow-hidden border border-white/[0.08]">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 via-[#0D0D1B] to-blue-900/30" />
            <div className="absolute -top-px left-16 right-16 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />
            <div className="relative">
              <div className="text-3xl mb-5">✦</div>
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Ready to write together?
              </h2>
              <p className="text-gray-400 mb-8 text-sm">
                Free to start. No credit card required. Set up in 60 seconds.
              </p>
              <Link
                href="/auth/signup"
                className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
              >
                Get started for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="relative z-10 px-6 md:px-12 lg:px-20 py-8 border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="w-6 h-6" gradientId="footer-logo" />
            <span className="font-bold font-display text-sm text-gray-300">SyncScribe</span>
          </Link>
          <p className="text-xs text-gray-600">
            © 2024 SyncScribe. Built for teams who write together.
          </p>
          <div className="flex items-center gap-5 text-xs text-gray-600">
            <Link href="/auth/login" className="hover:text-gray-400 transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-gray-400 transition-colors">Sign Up</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
