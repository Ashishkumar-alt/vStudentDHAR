"use client";

import RequireProfile from "@/components/auth/RequireProfile";
import RoomPostForm from "@/components/post/RoomPostForm";

export default function PostRoomClient() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Post room</h1>
      <p className="mt-2 text-sm text-zinc-600">Add real photos. Add WhatsApp number.</p>
      <RequireProfile>
        <RoomPostForm />
      </RequireProfile>
    </main>
  );
}

