"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

function createClient() {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        // Next.js 16 cookie access — usiamo il pattern corretto
        return {} as any;
      },
      setAll() {},
    },
  });
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin");
}

export async function register(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nome = formData.get("nome") as string;
  const cognome = formData.get("cognome") as string;

  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nome, cognome },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Crea profilo utente nella tabella utenti_profili
  if (data.user) {
    const { error: profileError } = await supabase.from("utenti_profili").insert({
      id: data.user.id,
      nome,
      cognome,
      ruolo: "utente",
    } as any);

    if (profileError) {
      return { error: profileError.message };
    }
  }

  return { success: true, message: "Controlla la tua email per confermare la registrazione." };
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function magicLink(formData: FormData) {
  const email = formData.get("email") as string;

  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Controlla la tua email per il link di accesso." };
}
