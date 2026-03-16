"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "system-ui",
      }}
    >
      <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Something went wrong</h2>
      <p style={{ color: "#666", marginBottom: "1.5rem", textAlign: "center", maxWidth: "400px" }}>
        Add AUTH_SECRET in Vercel → Settings → Environment Variables, then redeploy.
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          onClick={() => reset()}
          style={{
            padding: "0.5rem 1rem",
            background: "#000",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: "0.5rem 1rem",
            background: "#eee",
            color: "#333",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}
