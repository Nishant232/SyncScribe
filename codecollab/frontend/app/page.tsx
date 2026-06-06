import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center space-y-6 p-8 max-w-3xl">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">
          CodeCollab
        </h1>
        <p className="text-2xl text-gray-600 dark:text-gray-300">
          Real-time collaborative document editing
        </p>
        <p className="text-lg text-gray-500 dark:text-gray-400">
          Work together seamlessly with live cursors, presence indicators, and instant sync
        </p>
        
        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/auth/signup"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
          >
            Get Started Free
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white hover:bg-gray-50 border-2 border-blue-600 rounded-lg transition-colors shadow-lg"
          >
            Sign In
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl mb-2">🚀</div>
            <h3 className="font-semibold">Real-Time Sync</h3>
            <p className="text-sm text-gray-500">Instant updates across all devices</p>
          </div>
          <div>
            <div className="text-4xl mb-2">👥</div>
            <h3 className="font-semibold">Live Collaboration</h3>
            <p className="text-sm text-gray-500">See who&apos;s editing in real-time</p>
          </div>
          <div>
            <div className="text-4xl mb-2">🔒</div>
            <h3 className="font-semibold">Secure Sharing</h3>
            <p className="text-sm text-gray-500">Control access with permissions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
