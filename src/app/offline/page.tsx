export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold">You’re offline</h1>
      <p className="mt-2 text-sm text-zinc-500">
        vStudent needs an internet connection to load the latest listings. Please try again when you’re
        back online.
      </p>
    </main>
  );
}
