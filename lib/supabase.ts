import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { io } from "next/cache";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Tanpa env, museum dan kuis tetap jalan; fitur akun menampilkan pesan konfigurasi.
export const supabaseReady = Boolean(url && key);

// Klien dengan sesi pengguna (cookie). Hak akses ditegakkan RLS di database, bukan di sini.
export async function supabaseServer() {
  // Klien auth membaca Date.now() untuk cek kedaluwarsa sesi. Dengan partialPrefetching, cookies() ikut terbaca saat
  // prerender app shell, jadi bukan titik tunda lagi: io() menahan bagian akun sampai request sungguhan.
  await io();
  const store = await cookies();
  return createServerClient(url!, key!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {} // dipanggil dari Server Component: proxy.ts yang menyegarkan cookie
      },
    },
  });
}

// Tanpa cookie, untuk data publik yang di-cache ("use cache" tidak boleh membaca cookie).
export const supabasePublic = () => createClient(url!, key!, { auth: { persistSession: false } });
