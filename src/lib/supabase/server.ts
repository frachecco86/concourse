import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Creates a Supabase client for use in proxy.ts.
 * Handles cookie reading/writing via the request/response objects.
 */
export function createProxySupabaseClient(request: NextRequest) {
  let responseCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookies) {
        responseCookies = cookies.map(({ name, value, options }) => ({
          name,
          value,
          options,
        }));
      },
    },
  });

  const response = NextResponse.next({ request });

  for (const { name, value, options } of responseCookies) {
    response.cookies.set(name, value, options as any);
  }

  return { client, response };
}

/**
 * Creates a Supabase client for use in Server Components (async).
 * Reads cookies from the request via next/headers.
 * Use this instead of createServerClient with empty cookies.
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies();

  const client = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // Server components cannot set cookies — use Route Handlers for mutations
      },
    },
  });

  return client;
}

/**
 * Creates a Supabase client for Server Components using the service role key.
 * Bypasses RLS — only for admin pages where the middleware already verified auth.
 */
export async function createAdminServerClient() {
  const cookieStore = await cookies();

  const client = createServerClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      // Use cookies so getUser() works for admin verification
      autoRefreshToken: false,
      persistSession: false,
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op
      },
    },
  });

  return client;
}
