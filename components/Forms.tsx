"use client";

import { useActionState, useState } from "react";
import { signIn, signOut, signUp, submitStory, updateName, type FormState } from "@/app/actions";
import { clearStamps } from "@/lib/passport";

const input = "w-full rounded-md border border-sogan/25 bg-white/60 px-3 py-3 focus:border-bata";
const button = "rounded-md bg-bata px-5 py-3 font-medium text-white hover:bg-sogan disabled:opacity-60";

function Feedback({ state }: { state: FormState }) {
  if (!state) return null;
  return (
    <p role={state.error ? "alert" : "status"} className={`text-sm ${state.error ? "text-bata" : "text-sogan"}`}>
      {state.error ?? state.message}
    </p>
  );
}

export function AuthForms() {
  const [mode, setMode] = useState<"masuk" | "daftar">("masuk");
  const [loginState, login, loggingIn] = useActionState(signIn, undefined);
  const [signupState, signup, signingUp] = useActionState(signUp, undefined);
  const isLogin = mode === "masuk";
  const values = (isLogin ? loginState : signupState)?.values;

  return (
    <div className="max-w-md">
      <div className="flex gap-1 rounded-lg bg-kertas-2 p-1">
        {(["masuk", "daftar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-md px-4 py-3 text-sm font-medium ${mode === m ? "bg-kertas shadow-sm" : "text-sogan-2"}`}
          >
            {m === "masuk" ? "Masuk" : "Daftar akun baru"}
          </button>
        ))}
      </div>

      <form action={isLogin ? login : signup} className="mt-6 space-y-4">
        {!isLogin && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Nama tampilan</span>
            <input name="name" defaultValue={values?.name} required minLength={2} maxLength={40} autoComplete="nickname" className={input} />
            <span className="block text-xs text-sogan-2">Muncul di papan peringkat dan cerita yang kamu kirim.</span>
          </label>
        )}
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Email</span>
          <input name="email" type="email" defaultValue={values?.email} required autoComplete="email" className={input} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Kata sandi</span>
          <input
            name="password"
            type="password"
            required
            minLength={isLogin ? undefined : 8}
            autoComplete={isLogin ? "current-password" : "new-password"}
            className={input}
          />
        </label>
        <Feedback state={isLogin ? loginState : signupState} />
        <button disabled={loggingIn || signingUp} className={`${button} w-full`}>
          {isLogin ? (loggingIn ? "Memeriksa…" : "Masuk ke akun") : signingUp ? "Membuat akun…" : "Buat akun"}
        </button>
      </form>
    </div>
  );
}

export function NameForm({ name }: { name: string }) {
  const [state, action, pending] = useActionState(updateName, undefined);
  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <label className="min-w-0 flex-1 space-y-1.5">
        <span className="text-sm font-medium">Nama tampilan</span>
        <input name="name" defaultValue={state?.values?.name ?? name} required minLength={2} maxLength={40} className={input} />
      </label>
      <button disabled={pending} className={button}>
        {pending ? "Menyimpan…" : "Simpan nama"}
      </button>
      <div className="w-full">
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function StoryForm({ province }: { province: string }) {
  const [state, action, pending] = useActionState(submitStory, undefined);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="province" value={province} />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Judul</span>
        <input name="title" defaultValue={state?.values?.title} required minLength={3} maxLength={80} className={input} />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Cerita, tradisi, atau koreksi dari daerahmu</span>
        <textarea name="body" defaultValue={state?.values?.body} required minLength={20} maxLength={2000} rows={5} className={input} />
      </label>
      <Feedback state={state} />
      <button disabled={pending} className={button}>
        {pending ? "Mengirim…" : "Kirim ke kurator"}
      </button>
    </form>
  );
}

// Paspor lokal ikut dihapus supaya cap akun ini tidak tertinggal di perangkat bersama.
export function LogoutButton() {
  return (
    <form action={signOut} onSubmit={clearStamps}>
      <button className="rounded-md border border-sogan/30 px-4 py-3 text-sm font-medium hover:border-bata hover:text-bata">Keluar</button>
    </form>
  );
}
