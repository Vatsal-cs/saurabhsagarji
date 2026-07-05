import { createClient as createBaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Cookie-free Supabase client for build-time contexts and public reads.
 * Uses anon key. RLS applies.
 */
export function createStaticClient() {
  return createBaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Service-role client that bypasses RLS. Used ONLY on the server for
 * privileged operations like signing URLs for private buckets.
 * NEVER expose this to the client.
 */
export function createServiceClient() {
  return createBaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
