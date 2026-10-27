
"use client";

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="mt-6 rounded-full border border-current/20 px-5 py-2 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
    >
      Try again
    </button>
  );
}
