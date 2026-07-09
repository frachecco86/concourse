import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
});

/**
 * Crea un prodotto Stripe a partire da un corso.
 * Se il prodotto esiste già (stripe_product_id), lo riusa.
 */
export async function getOrCreateStripeProduct(
  corsoId: string,
  nome: string,
  prezzo: number,
  description?: string | null,
): Promise<{ productId: string; priceId: string }> {
  // Recupera da Supabase se già esiste
  const { createServerClient } = await import("@supabase/ssr");
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => ({} as any), setAll: () => {} },
  });

  const { data: corso } = await supabase
    .from("corsi")
    .select("stripe_product_id, stripe_price_id")
    .eq("id", corsoId)
    .single();

  if (corso?.stripe_product_id && corso?.stripe_price_id) {
    return { productId: corso.stripe_product_id, priceId: corso.stripe_price_id };
  }

  // Crea prodotto Stripe
  const product = await stripe.products.create({
    name: nome,
    description: description ?? undefined,
  });

  // Crea prezzo in centesimi (Stripe usa centesimi)
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(prezzo * 100),
    currency: "eur",
  });

  // Salva su Supabase
  await supabase
    .from("corsi")
    .update({ stripe_product_id: product.id, stripe_price_id: price.id } as any)
    .eq("id", corsoId);

  return { productId: product.id, priceId: price.id };
}
