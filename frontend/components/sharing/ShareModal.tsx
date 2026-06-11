'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Check, Trash2, Share2 } from 'lucide-react'
import { sharingAPI } from '@/lib/api'
import type { Collaborator } from '@/types'

interface Props {
  documentId: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ documentId, isOpen, onClose }: Props) {
  const [shareLink, setShareLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [role, setRole] = useState<'editor' | 'viewer'>('viewer')
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadCollaborators()
    }
  }, [isOpen, documentId])

  const loadCollaborators = async () => {
    try {
      const { data } = await sharingAPI.getCollaborators(documentId)
      setCollaborators(data.collaborators)
    } catch (error) {
      console.error('Error loading collaborators:', error)
    }
  }

  const generateShareLink = async () => {
    setLoading(true)
    try {
      const { data } = await sharingAPI.createShareLink(documentId, {
        role,
        expiresInDays: 7,
      })
      setShareLink(data.link)
    } catch (error) {
      console.error('Error generating share link:', error)
      alert('Failed to generate share link')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const removeCollaborator = async (userId: string) => {
    if (!confirm('Remove this person from the document?')) return

    try {
      await sharingAPI.removeCollaborator(documentId, userId)
      setCollaborators(collaborators.filter((c) => c.id !== userId))
    } catch (error) {
      console.error('Error removing collaborator:', error)
      alert('Failed to remove collaborator')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Share Document
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Invite others to view or edit this document
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Generate Link Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Access Level
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'editor' | 'viewer')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viewer">Viewer (can only read)</option>
                <option value="editor">Editor (can edit)</option>
              </select>
            </div>

            <button
              onClick={generateShareLink}
              disabled={loading}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors"
            >
              {loading ? 'Generating...' : 'Generate Share Link'}
            </button>

            {shareLink && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Collaborators List */}
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white">People with access</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {collaborators.map((collaborator) => (
                <div
                  key={collaborator.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                      {collaborator.email.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {collaborator.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 capitalize px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                      {collaborator.role}
                    </span>
                    {collaborator.role !== 'owner' && (
                      <button
                        onClick={() => removeCollaborator(collaborator.id)}
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
