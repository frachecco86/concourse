import type Stripe from "stripe";

let _stripe: Stripe | null = null;

/**
 * Restituisce un'istanza Stripe inizializzata lazy.
 * La chiave API deve essere configurata in .env.local.
 * Se manca, restituisce null — le route Stripe restituiranno errore.
 */
async function getStripe(): Promise<Stripe> {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY non configurata. Imposta la variabile in .env.local."
      );
    }
    const { default: StripeLib } = await import("stripe");
    _stripe = new StripeLib(key, {
      apiVersion: "2026-06-24.dahlia",
      typescript: true,
    } as any);
  }
  return _stripe;
}

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
  const stripe = await getStripe();

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

  const product = await stripe.products.create({
    name: nome,
    description: description ?? undefined,
  });

  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(prezzo * 100),
    currency: "eur",
  });

  await supabase
    .from("corsi")
    .update({ stripe_product_id: product.id, stripe_price_id: price.id } as any)
    .eq("id", corsoId);

  return { productId: product.id, priceId: price.id };
}

export { getStripe };
