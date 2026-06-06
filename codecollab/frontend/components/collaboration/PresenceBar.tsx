'use client'

import { useDocumentStore } from '@/lib/store'

export default function PresenceBar() {
  const { onlineUsers } = useDocumentStore()

  const visibleUsers = onlineUsers.slice(0, 5)
  const remainingCount = onlineUsers.length - 5

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">
        {onlineUsers.length} {onlineUsers.length === 1 ? 'user' : 'users'} online
      </span>
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <div
            key={user.socketId}
            className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs font-semibold shadow-sm"
            style={{ backgroundColor: user.color }}
            title={user.email}
          >
            {user.email.substring(0, 2).toUpperCase()}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 text-xs font-semibold text-gray-600">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  )
}
