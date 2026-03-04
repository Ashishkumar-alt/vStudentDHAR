"use client";

import { useState } from "react";
import { addDoc } from "firebase/firestore";
import { reportsRef } from "@/lib/firebase/refs";
import { serverTimestamp } from "@/lib/firebase/db";
import { useAuth } from "@/components/auth/AuthProvider";

const REASONS = ["Spam", "Fake", "Wrong info", "Other"] as const;

export default function ReportListing({
  listingType,
  listingId,
}: {
  listingType: "room" | "item";
  listingId: string;
}) {
  const { user } = useAuth();
  const [reason, setReason] = useState<(typeof REASONS)[number]>("Spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      if (!user) throw new Error("Sign in to report.");
      await addDoc(reportsRef(), {
        listingType,
        listingId,
        reason,
        details: details.trim() || undefined,
        status: "open",
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to report");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <p className="text-sm text-green-700">Report submitted. Thanks.</p>;
  }

  return (
    <div className="card p-4">
      <div className="text-sm font-semibold">Report listing</div>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-1">
          <label className="text-xs font-medium text-zinc-600">Reason</label>
          <select
            className="select mt-1"
            value={reason}
            onChange={(e) => setReason(e.target.value as (typeof REASONS)[number])}
          >
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-zinc-600">Details (optional)</label>
          <input
            className="input mt-1"
            placeholder="What’s wrong?"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
        </div>
      </div>
      <button className="btn mt-3" onClick={submit} disabled={busy}>
        {busy ? "Submitting…" : "Report"}
      </button>
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
