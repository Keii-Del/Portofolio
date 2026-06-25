"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <section className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="font-display text-7xl text-red-400 mb-4">⚠</div>
        <h1 className="heading-display mb-6">Terjadi Kesalahan</h1>
        <p className="text-slate-400 mb-8">
          Maaf, ada masalah teknis. Tim sudah dapat notifikasi. Coba lagi
          beberapa saat.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-600 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <button type="button" onClick={reset} className="btn-primary">
          Coba Lagi
        </button>
      </div>
    </section>
  );
}
