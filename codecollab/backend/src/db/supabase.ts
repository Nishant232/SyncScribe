import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import ws from 'ws';
import type { WebSocketLikeConstructor } from '@supabase/realtime-js';

// Convert the ws constructor to the shape expected by Supabase realtime client
const wsTransport: WebSocketLikeConstructor = ws as unknown as WebSocketLikeConstructor;

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

// Admin client with service role (bypasses RLS)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: { transport: wsTransport }
  }
);

// Regular client with anon key (respects RLS)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  { realtime: { transport: wsTransport } }
);

// Helper to verify JWT token
export async function verifyToken(token: string) {
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    throw new Error('Invalid token');
  }

  return user;
}

// Helper to get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw new Error('User not found');
  }

  return data.user;
}
