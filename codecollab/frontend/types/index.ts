export interface User {
  id: string;
  email: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  owner_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  user_role?: 'owner' | 'editor' | 'viewer';
}

export interface CollaboratorUser extends User {
  color: string;
  socketId: string;
  joinedAt: number;
}

export interface CursorPosition {
  userId: string;
  userName: string;
  position: number;
  color: string;
  socketId?: string;
}

export interface DocumentPermission {
  document_id: string;
  user_id: string;
  role: 'owner' | 'editor' | 'viewer';
}

export interface ShareLink {
  id: string;
  document_id: string;
  token: string;
  role: 'editor' | 'viewer';
  expires_at: string | null;
  created_at: string;
}

export interface Collaborator extends User {
  role: 'owner' | 'editor' | 'viewer';
  created_at: string;
}
