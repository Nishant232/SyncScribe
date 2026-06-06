import { Server, Socket } from 'socket.io';
import { RoomManager } from './rooms';
import { supabaseAdmin } from '../db/supabase';
import { debounce } from 'lodash';

interface User {
  id: string;
  email: string;
  color: string;
}

interface CursorPosition {
  userId: string;
  userName: string;
  position: number;
  color: string;
}

interface DocumentEdit {
  userId: string;
  content: string;
  timestamp: number;
  position?: number;
}

const roomManager = new RoomManager();

// Debounced save functions per document
const debouncedSaves = new Map<string, any>();

function getDebouncedSave(documentId: string) {
  if (!debouncedSaves.has(documentId)) {
    debouncedSaves.set(
      documentId,
      debounce(async (content: string, userId: string) => {
        try {
          const { error } = await supabaseAdmin
            .from('documents')
            .update({
              content,
              updated_at: new Date().toISOString(),
            })
            .eq('id', documentId);

          if (error) throw error;
          
          console.log(`💾 Saved document ${documentId} to database`);
        } catch (error) {
          console.error('Error saving document:', error);
        }
      }, 500)
    );
  }
  return debouncedSaves.get(documentId);
}

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join document room
    socket.on('join-document', async (data: { documentId: string; user: User }) => {
      const { documentId, user } = data;
      
      console.log(`👤 User ${user.email} joining document ${documentId}`);

      // Verify user has access to document
      try {
        // Check direct ownership
        const { data: document } = await supabaseAdmin
          .from('documents')
          .select('owner_id')
          .eq('id', documentId)
          .single();

        let hasAccess = document?.owner_id === user.id;

        if (!hasAccess) {
          const { data: permission, error } = await supabaseAdmin
            .from('document_permissions')
            .select('role')
            .eq('document_id', documentId)
            .eq('user_id', user.id)
            .single();

          hasAccess = !error && !!permission;
        }

        if (!hasAccess) {
          socket.emit('permission-denied', {
            error: 'You do not have access to this document',
          });
          return;
        }

        // Join the room
        socket.join(documentId);
        
        // Track user in room
        roomManager.addUserToRoom(documentId, socket.id, user);

        // Get all users currently in the room
        const roomUsers = roomManager.getRoomUsers(documentId);

        // Notify others that a new user joined
        socket.to(documentId).emit('user-joined', {
          user,
          timestamp: Date.now(),
        });

        // Send current users list to the newly joined user
        socket.emit('room-users', {
          users: roomUsers,
          timestamp: Date.now(),
        });

        // Broadcast updated users list to everyone
        io.to(documentId).emit('users-updated', {
          users: roomUsers,
          count: roomUsers.length,
        });

        console.log(`📊 Room ${documentId} now has ${roomUsers.length} users`);
      } catch (error) {
        console.error('Error joining document:', error);
        socket.emit('error', { message: 'Failed to join document' });
      }
    });

    // Handle document content changes
    socket.on('document-change', async (data: DocumentEdit) => {
      const documentId = getDocumentIdFromSocket(socket);
      
      if (!documentId) {
        console.error('❌ No document room found for socket');
        return;
      }

      // Verify user has edit permission
      try {
        const { data: document } = await supabaseAdmin
          .from('documents')
          .select('owner_id')
          .eq('id', documentId)
          .single();

        let canEdit = document?.owner_id === data.userId;

        if (!canEdit) {
          const { data: permission } = await supabaseAdmin
            .from('document_permissions')
            .select('role')
            .eq('document_id', documentId)
            .eq('user_id', data.userId)
            .in('role', ['owner', 'editor'])
            .single();

          canEdit = !!permission;
        }

        if (!canEdit) {
          socket.emit('permission-denied', {
            error: 'You do not have permission to edit this document',
          });
          return;
        }

        // Broadcast change to all other users in the room (immediate)
        socket.to(documentId).emit('document-update', {
          ...data,
          timestamp: Date.now(),
        });

        // Save to database (debounced to avoid spam)
        const debouncedSave = getDebouncedSave(documentId);
        debouncedSave(data.content, data.userId);

      } catch (error) {
        console.error('Error handling document change:', error);
      }
    });

    // Handle cursor position updates
    socket.on('cursor-move', (data: CursorPosition) => {
      const documentId = getDocumentIdFromSocket(socket);
      
      if (!documentId) return;

      // Broadcast cursor position to others (throttled on client)
      socket.to(documentId).emit('cursor-update', {
        ...data,
        socketId: socket.id,
        timestamp: Date.now(),
      });
    });

    // Handle typing indicator
    socket.on('typing-start', (data: { userId: string; userName: string }) => {
      const documentId = getDocumentIdFromSocket(socket);
      if (!documentId) return;

      socket.to(documentId).emit('user-typing', {
        ...data,
        timestamp: Date.now(),
      });
    });

    socket.on('typing-stop', (data: { userId: string }) => {
      const documentId = getDocumentIdFromSocket(socket);
      if (!documentId) return;

      socket.to(documentId).emit('user-stopped-typing', {
        userId: data.userId,
      });
    });

    // Handle comments
    socket.on('add-comment', (data: any) => {
      const documentId = getDocumentIdFromSocket(socket);
      if (!documentId) return;

      // Broadcast new comment to all users
      io.to(documentId).emit('comment-added', {
        ...data,
        timestamp: Date.now(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);

      const documentId = getDocumentIdFromSocket(socket);
      
      if (documentId) {
        const user = roomManager.removeUserFromRoom(documentId, socket.id);
        
        if (user) {
          // Notify others that user left
          socket.to(documentId).emit('user-left', {
            user,
            timestamp: Date.now(),
          });

          // Send updated users list
          const roomUsers = roomManager.getRoomUsers(documentId);
          io.to(documentId).emit('users-updated', {
            users: roomUsers,
            count: roomUsers.length,
          });

          console.log(`👋 User ${user.email} left document ${documentId}`);
        }
      }
    });

    // Heartbeat for connection monitoring
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  });
}

// Helper function to get document ID from socket rooms
function getDocumentIdFromSocket(socket: Socket): string | null {
  const rooms = Array.from(socket.rooms);
  // First room is always the socket ID, second is the document room
  return rooms.find(room => room !== socket.id) || null;
}
