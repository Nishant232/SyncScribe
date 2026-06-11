import { Server, Socket } from 'socket.io';
import { RoomManager } from './rooms';
import { supabaseAdmin, verifyToken } from '../db/supabase';
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
      debounce(async (content: string) => {
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
  // Verify JWT on every new socket connection
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      const user = await verifyToken(token);
      socket.data.userId = user.id;
      socket.data.userEmail = user.email;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join document room
    socket.on('join-document', async (data: { documentId: string; user: User }) => {
      const { documentId } = data;
      // Use server-verified identity — never trust the client-provided user.id
      const verifiedUserId: string = socket.data.userId;
      const user: User = {
        id: verifiedUserId,
        email: socket.data.userEmail || data.user.email,
        color: data.user.color,
      };

      // Deduplicate: React StrictMode double-mounts cause two join events
      // from the same socket. addUserToRoom is keyed by socketId so the
      // room count stays correct, but we skip the redundant DB + broadcast work.
      if (roomManager.isUserInRoom(documentId, socket.id)) {
        const roomUsers = roomManager.getRoomUsers(documentId);
        socket.emit('room-users', { users: roomUsers, timestamp: Date.now() });
        return;
      }

      console.log(`👤 User ${user.email} joining document ${documentId}`);

      // Verify user has access to document
      try {
        // Check direct ownership
        const { data: document } = await supabaseAdmin
          .from('documents')
          .select('owner_id')
          .eq('id', documentId)
          .single();

        let hasAccess = document?.owner_id === verifiedUserId;

        if (!hasAccess) {
          const { data: permission, error } = await supabaseAdmin
            .from('document_permissions')
            .select('role')
            .eq('document_id', documentId)
            .eq('user_id', verifiedUserId)
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
        const editorId: string = socket.data.userId;
        const { data: document } = await supabaseAdmin
          .from('documents')
          .select('owner_id')
          .eq('id', documentId)
          .single();

        let canEdit = document?.owner_id === editorId;

        if (!canEdit) {
          const { data: permission } = await supabaseAdmin
            .from('document_permissions')
            .select('role')
            .eq('document_id', documentId)
            .eq('user_id', editorId)
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
        debouncedSave(data.content);

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

    // Handle explicit leave (user navigates away while socket stays open)
    socket.on('leave-document', (data: { documentId: string }) => {
      const { documentId } = data;
      socket.leave(documentId);
      const user = roomManager.removeUserFromRoom(documentId, socket.id);
      if (user) {
        socket.to(documentId).emit('user-left', { user, timestamp: Date.now() });
        const roomUsers = roomManager.getRoomUsers(documentId);
        io.to(documentId).emit('users-updated', { users: roomUsers, count: roomUsers.length });
        console.log(`👋 User ${user.email} left document ${documentId} (navigated away)`);
      }
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
