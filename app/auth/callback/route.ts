import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase";

// Tujuan tautan konfirmasi email Supabase: tukar kode jadi sesi, lalu kembali ke game.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) await (await supabaseServer()).auth.exchangeCodeForSession(code);
  return NextResponse.redirect(new URL("/", request.url));
}
