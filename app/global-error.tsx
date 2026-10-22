"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-xs text-slate-400 mb-6">{error.message || "An unexpected error occurred."}</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
