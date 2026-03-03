"use client";

import RequireProfile from "@/components/auth/RequireProfile";
import ItemPostForm from "@/components/post/ItemPostForm";

export default function PostItemPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Post used item</h1>
      <p className="mt-2 text-sm text-zinc-600">Add clear photos. Keep price realistic.</p>
      <RequireProfile>
        <ItemPostForm />
      </RequireProfile>
    </main>
  );
}

