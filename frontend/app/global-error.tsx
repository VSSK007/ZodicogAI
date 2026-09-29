"use client";

/**
 * Last-resort boundary: renders when the root layout itself throws, so it must
 * bring its own <html>/<body> and can't rely on the app's tokens or fonts.
 */
import { useEffect } from "react";
import { reportError } from "@/lib/monitoring";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { digest: error.digest, boundary: "global-error" });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#0b0a14",
          color: "#f0eff6",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <h1 style={{ fontSize: 32, margin: 0 }}>A retrograde moment.</h1>
        <p style={{ color: "#a6a2ba", maxWidth: 420, margin: 0 }}>
          Something went wrong on our side. Trying again usually clears it.
        </p>
        <button
          onClick={reset}
          style={{
            background: "#8b7cf6",
            color: "#0b0a14",
            border: 0,
            borderRadius: 9,
            padding: "12px 28px",
            fontWeight: 600,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
