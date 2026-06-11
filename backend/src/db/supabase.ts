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

const VERIFY_MAX_RETRIES = 3;
const VERIFY_BASE_DELAY_MS = 500;

// Helper to verify JWT token with exponential backoff retries
export async function verifyToken(token: string) {
  let lastError: unknown;

  for (let attempt = 0; attempt < VERIFY_MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, VERIFY_BASE_DELAY_MS * 2 ** (attempt - 1)));
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new Error('Invalid token');
      }

      return user;
    } catch (err) {
      lastError = err;
      const isNetworkError = err instanceof Error && (
        err.message === 'fetch failed' ||
        (err.cause as any)?.code === 'UND_ERR_CONNECT_TIMEOUT'
      );
      if (!isNetworkError) throw err; // non-retryable (bad token, etc.)
      console.warn(`verifyToken attempt ${attempt + 1} failed (network), retrying...`);
    }
  }

  throw lastError;
}

// Helper to get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

  if (error || !data.user) {
    throw new Error('User not found');
  }

  return data.user;
}
