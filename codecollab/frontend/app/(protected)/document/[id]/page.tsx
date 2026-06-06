'use client';

import { useParams } from 'next/navigation';
import { useDocument } from '@/lib/hooks/useDocument';
import { useCollaboration } from '@/lib/hooks/useCollaboration';
import { useDocumentStore } from '@/lib/store';
import Editor from '@/components/editor/Editor';
import SavingIndicator from '@/components/editor/SavingIndicator';
import PresenceBar from '@/components/collaboration/PresenceBar';
import ShareModal from '@/components/sharing/ShareModal';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function DocumentPage() {
  // -------------------------------------------------------------
  // Get the document id from the URL parameters (Next.js App Router)
  // -------------------------------------------------------------
  const { id } = useParams<{ id: string }>(); // <-- correct way

  // Local UI state
  const [shareOpen, setShareOpen] = useState(false);

  // Pull the current document and socket connection status from the store
  const { currentDocument, isConnected } = useDocumentStore();

  // ----------------------------------------------------------------
  // Load the document data (calls Supabase, updates store)
  // ----------------------------------------------------------------
  useDocument(id);

  // ----------------------------------------------------------------
  // Initialise real‑time collaboration (Socket.io)
  // ----------------------------------------------------------------
  useCollaboration(id);

  // -------------------------------------------------------------
  // Render loading skeleton while the document is being fetched
  // -------------------------------------------------------------
  if (!currentDocument) {
    return (
      <div className="h-screen flex flex-col">
        <div className="border-b p-4">
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="flex-1 p-8">
          <div className="h-full w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Main UI – Toolbar, Editor, Presence, Share modal
  // -------------------------------------------------------------
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {currentDocument.title}
          </h1>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <SavingIndicator />
          <PresenceBar />
          <button
            onClick={() => setShareOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Share
          </button>
        </div>
      </div>

      {/* Editor */}
      <Editor documentId={id} />

      {/* Share Modal */}
      {shareOpen && (
        <ShareModal
          documentId={id}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
