
import RetryButton from "./OfflineRetryButton";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6 text-[var(--foreground)]">
      <section className="max-w-sm text-center">
        <h1 className="text-2xl font-semibold">
          You’re offline
        </h1>

        <p className="mt-3 opacity-70">
          Smriti Notes couldn’t load this page.
          Your locally saved notes remain on this device.
        </p>

        <RetryButton />
      </section>
    </main>
  );
}
