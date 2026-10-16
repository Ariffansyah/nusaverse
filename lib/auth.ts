import { cache } from "react";
import { supabaseReady, supabaseServer } from "@/lib/supabase";

export type Viewer = { id: string; name: string; role: "user" | "admin" };

// Pengguna yang sedang masuk, dibaca sekali per request. Panggil di dalam <Suspense> (membaca cookie).
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!supabaseReady) return null;
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims.sub;
  if (!id) return null;
  const { data: profile } = await supabase.from("profiles").select("display_name, role").eq("id", id).single();
  return profile ? { id, name: profile.display_name, role: profile.role } : null;
});
