import { createServerClient } from "@supabase/ssr";
import type { MetadataRoute } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => ({} as any), setAll: () => {} },
  });

  const { data: concorsi } = await supabase
    .from("concorsi")
    .select("slug, updated_at")
    .eq("stato", "aperto");

  const concorsiEntries = (concorsi ?? []).map((c: any) => ({
    url: `https://concourse.vercel.app/concorsi/${c.slug}`,
    lastModified: c.updated_at ?? new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: "https://concourse.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...concorsiEntries,
  ];
}
