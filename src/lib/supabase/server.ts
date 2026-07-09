import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

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
