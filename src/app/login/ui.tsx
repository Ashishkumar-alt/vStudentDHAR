"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPassword, signInWithEmail, signUpWithEmail } from "@/lib/firebase/auth";

export default function LoginClient() {
  const router = useRouter();
  const search = useSearchParams();
  const next = useMemo(() => search.get("next") || "/post", [search]);

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const e = email.trim().toLowerCase();
      if (!e.includes("@")) throw new Error("Enter a valid email.");
      if (password.length < 6) throw new Error("Password must be at least 6 characters.");

      if (mode === "signup") {
        if (password !== confirm) throw new Error("Passwords do not match.");
        await signUpWithEmail(e, password);
      } else {
        await signInWithEmail(e, password);
      }

      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword() {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const e = email.trim().toLowerCase();
      if (!e.includes("@")) throw new Error("Enter your email first.");
      await resetPassword(e);
      setMessage("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6">
          <h1 className="text-2xl font-semibold">{mode === "signin" ? "Sign in" : "Create account"}</h1>
          <p className="mt-2 text-sm text-slate-600">Email + password (no SMS billing).</p>
          <div className="mt-4 inline-flex rounded-full bg-slate-100 p-1">
            <button
              type="button"
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium",
                mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600",
              ].join(" ")}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={[
                "rounded-full px-4 py-1.5 text-sm font-medium",
                mode === "signup" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600",
              ].join(" ")}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
          </div>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium">Email</label>
          <input
            className="input mt-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            inputMode="email"
            autoComplete="email"
          />

          <label className="mt-4 block text-sm font-medium">Password</label>
          <input
            className="input mt-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
          />

          {mode === "signup" ? (
            <>
              <label className="mt-4 block text-sm font-medium">Confirm password</label>
              <input
                className="input mt-2"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type="password"
                autoComplete="new-password"
              />
            </>
          ) : null}

          <button className="btn btn-primary mt-6 w-full" onClick={onSubmit} disabled={busy}>
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>

          {mode === "signin" ? (
            <button className="btn mt-3 w-full" onClick={onResetPassword} disabled={busy}>
              Forgot password
            </button>
          ) : null}

          {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}

