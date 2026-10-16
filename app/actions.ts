"use server";

import { refresh, updateTag } from "next/cache";
import { headers } from "next/headers";
import { findProvince } from "@/data/cultureData";
import { getViewer } from "@/lib/auth";
import { supabaseServer } from "@/lib/supabase";

// `values` mengembalikan isian saat gagal: React mereset form setelah action, tanpa ini ketikan pengguna hilang.
export type FormState = { error?: string; message?: string; values?: Record<string, string> } | undefined;

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export async function signIn(_: FormState, form: FormData): Promise<FormState> {
  const email = text(form, "email");
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password: String(form.get("password") ?? "") });
  if (error) return { error: error.code === "email_not_confirmed" ? "Konfirmasi email kamu dulu." : "Email atau kata sandi salah.", values: { email } };
  refresh(); // panel akun di game ikut berganti tanpa pindah halaman
}

export async function signUp(_: FormState, form: FormData): Promise<FormState> {
  const name = text(form, "name");
  const email = text(form, "email");
  const password = String(form.get("password") ?? "");
  const values = { name, email };
  if (name.length < 2 || name.length > 40) return { error: "Nama tampilan 2 sampai 40 karakter.", values };
  if (password.length < 8) return { error: "Kata sandi minimal 8 karakter.", values };

  const origin = (await headers()).get("origin");
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: name }, emailRedirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.code === "user_already_exists" ? "Email ini sudah terdaftar. Silakan masuk." : error.message, values };
  if (!data.session) return { message: "Akun dibuat. Buka tautan konfirmasi di email kamu, lalu masuk." };
  refresh();
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  refresh();
}

// Cap dari localStorage disalin ke akun. Tamu: tidak melakukan apa-apa.
export async function saveStamps(slugs: string[]) {
  const viewer = await getViewer();
  if (!viewer) return;
  const rows = slugs.filter((s) => findProvince(s)).map((province) => ({ user_id: viewer.id, province }));
  if (!rows.length) return;
  const supabase = await supabaseServer();
  await supabase.from("stamps").upsert(rows, { onConflict: "user_id,province", ignoreDuplicates: true });
  updateTag("peringkat");
}

export async function updateName(_: FormState, form: FormData): Promise<FormState> {
  const viewer = await getViewer();
  if (!viewer) return { error: "Sesi berakhir. Masuk lagi lewat menu Akun." };
  const name = text(form, "name");
  if (name.length < 2 || name.length > 40) return { error: "Nama tampilan 2 sampai 40 karakter.", values: { name } };
  const supabase = await supabaseServer();
  const { error } = await supabase.from("profiles").update({ display_name: name }).eq("id", viewer.id);
  if (error) return { error: "Nama gagal disimpan. Coba lagi.", values: { name } };
  updateTag("peringkat");
  refresh();
  return { message: "Nama tersimpan." };
}

export async function submitStory(_: FormState, form: FormData): Promise<FormState> {
  const province = text(form, "province");
  const title = text(form, "title");
  const body = text(form, "body");
  const values = { title, body };
  const viewer = await getViewer();
  if (!viewer) return { error: "Masuk dulu untuk berbagi cerita.", values };
  if (!findProvince(province)) return { error: "Provinsi tidak dikenal.", values };
  if (title.length < 3 || title.length > 80) return { error: "Judul 3 sampai 80 karakter.", values };
  if (body.length < 20 || body.length > 2000) return { error: "Cerita 20 sampai 2000 karakter.", values };

  const supabase = await supabaseServer();
  // ponytail: batas antrean per akun sebagai rem spam; pasang rate limit sungguhan kalau trafik nyata
  const { count } = await supabase.from("stories").select("id", { count: "exact", head: true }).eq("user_id", viewer.id).eq("status", "pending");
  if ((count ?? 0) >= 5) return { error: "Kamu punya 5 cerita yang masih ditinjau. Tunggu sebagian disetujui dulu.", values };

  const { error } = await supabase.from("stories").insert({ user_id: viewer.id, province, title, body });
  if (error) return { error: "Cerita gagal dikirim. Coba lagi.", values };
  return { message: "Terima kasih! Ceritamu akan tampil setelah ditinjau kurator." };
}

async function requireAdmin() {
  const viewer = await getViewer();
  if (viewer?.role !== "admin") throw new Error("Khusus admin");
  return supabaseServer();
}

export async function moderateStory(form: FormData) {
  const supabase = await requireAdmin();
  const status = text(form, "status") === "approved" ? "approved" : "rejected";
  const { data } = await supabase
    .from("stories")
    .update({ status, reviewed_at: new Date().toISOString() })
    .eq("id", Number(form.get("id")))
    .select("province")
    .single();
  if (data) updateTag(`cerita:${data.province}`);
  refresh();
}

export async function setRole(form: FormData) {
  const supabase = await requireAdmin();
  await supabase.rpc("set_role", { p_user: text(form, "user"), p_role: text(form, "role") });
  refresh();
}
