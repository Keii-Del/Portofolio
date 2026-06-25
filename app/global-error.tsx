"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";

// Catches errors in root layout (above error.tsx boundary).
// Required by Sentry for React render errors.

export default function GlobalError({ error }: { error: Error }) {
  Sentry.captureException(error);
  return (
    <html>
      <body>
        <NextError statusCode={500} />
      </body>
    </html>
  );
}