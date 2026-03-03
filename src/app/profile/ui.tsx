"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, updateProfileBasics } from "@/components/auth/AuthProvider";
import { INSTITUTIONS } from "@/lib/constants";
import { compressForUpload } from "@/lib/images";
import { getFirebaseStorageCandidates } from "@/lib/firebase/storage";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

export default function ProfileClient() {
  const { user, loading, profile, signOutNow } = useAuth();
  const router = useRouter();
  const search = useSearchParams();
  const next = useMemo(() => search.get("next") || "/post", [search]);

  const [name, setName] = useState("");
  const [institution, setInstitution] = useState<string>(INSTITUTIONS[0]);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [college, setCollege] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent("/profile")}`);
  }, [loading, user, router]);

  useEffect(() => {
    if (!profile) return;
    if (profile.name) setName(profile.name);
    if (profile.institution) setInstitution(profile.institution);
    if (profile.whatsappNumber) setWhatsappNumber(profile.whatsappNumber);
    if (profile.college) setCollege(profile.college);
  }, [profile]);

  async function onSave() {
    if (!user) return;
    setBusy(true);
    setError(null);
    setStage("Saving profile…");
    try {
      if (!name.trim()) throw new Error("Name is required.");
      if (!institution.trim()) throw new Error("Select your institution.");
      if (!whatsappNumber.trim()) throw new Error("WhatsApp number is required.");
      if (!whatsappNumber.trim().startsWith("+"))
        throw new Error("Enter WhatsApp number in E.164 format, e.g. +91XXXXXXXXXX");

      await updateProfileBasics(user.uid, {
        name: name.trim(),
        institution,
        whatsappNumber: whatsappNumber.trim(),
        college: college.trim() || undefined,
      });

      // Photo is optional; upload it after the basics are saved.
      if (photo) {
        setStage("Uploading photo…");

        const withTimeout = async <T,>(p: Promise<T>, ms: number, msg: string) => {
          let t: ReturnType<typeof setTimeout> | null = null;
          try {
            return await Promise.race([
              p,
              new Promise<T>((_, reject) => {
                t = setTimeout(() => reject(new Error(msg)), ms);
              }),
            ]);
          } finally {
            if (t) clearTimeout(t);
          }
        };

        // Compression can hang on some devices/browsers; skip for small files and add a timeout.
        const fileToUpload =
          photo.size <= 600 * 1024
            ? photo
            : await withTimeout(
                compressForUpload(photo, { maxMB: 0.5, maxSize: 800 }),
                15000,
                "Photo processing took too long. Try a smaller image or skip the photo.",
              );

        const storages = getFirebaseStorageCandidates();
        let photoUrl: string | null = null;
        let lastErr: unknown = null;

        for (const storage of storages) {
          try {
            const objectRef = ref(storage, `users/${user.uid}/profile.jpg`);
            await withTimeout(
              uploadBytes(objectRef, fileToUpload, { contentType: fileToUpload.type || "image/jpeg" }),
              25000,
              "Photo upload timed out. Check your internet and try again.",
            );
            photoUrl = await withTimeout(getDownloadURL(objectRef), 10000, "Could not fetch photo URL. Try again.");
            break;
          } catch (e) {
            lastErr = e;
          }
        }

        if (!photoUrl) {
          throw lastErr instanceof Error
            ? lastErr
            : new Error(
                "Photo upload failed. Check Firebase Storage is enabled and `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` is correct.",
              );
        }

        setStage("Finishing…");
        await updateProfileBasics(user.uid, { photoUrl, name: name.trim(), institution, whatsappNumber: whatsappNumber.trim(), college: college.trim() || undefined });
      }

      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setBusy(false);
      setStage(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-lg px-4 py-10">
      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white p-6">
          <h1 className="text-2xl font-semibold">Profile</h1>
          <p className="mt-2 text-sm text-slate-600">Complete your basics to post listings.</p>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium">Email</label>
          <input className="input mt-2" value={user?.email || ""} disabled />

          <label className="mt-4 block text-sm font-medium">Name *</label>
          <input className="input mt-2" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />

          <label className="mt-4 block text-sm font-medium">I study at *</label>
          <select className="select mt-2" value={institution} onChange={(e) => setInstitution(e.target.value)}>
            {INSTITUTIONS.map((inst) => (
              <option key={inst} value={inst}>
                {inst}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-medium">WhatsApp number *</label>
          <input
            className="input mt-2"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="+91XXXXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
          />
          <p className="mt-2 text-xs text-slate-500">This will be used for WhatsApp contact on your listings.</p>

          <label className="mt-4 block text-sm font-medium">College (optional)</label>
          <input className="input mt-2" value={college} onChange={(e) => setCollege(e.target.value)} />

          <label className="mt-4 block text-sm font-medium">Profile photo (optional)</label>
          <input className="mt-2 block w-full text-sm" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />

          <button className="btn btn-primary mt-5 w-full" onClick={onSave} disabled={busy || loading || !user}>
            {busy ? stage || "Saving..." : "Save profile"}
          </button>

          {user ? (
            <button className="btn mt-3 w-full" onClick={signOutNow} disabled={busy || loading}>
              Sign out
            </button>
          ) : null}

          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </div>
      </div>
    </main>
  );
}
