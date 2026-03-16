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
      <body style={{ fontFamily: "system-ui", padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Something went wrong</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem", maxWidth: "400px", margin: "0 auto 1.5rem" }}>
          Add <code>AUTH_SECRET</code> in Vercel → Settings → Environment Variables, then redeploy.
        </p>
        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
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
          <button
            onClick={() => (window.location.href = "/")}
            style={{
              padding: "0.5rem 1rem",
              background: "#eee",
              color: "#333",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Go home
          </button>
        </div>
      </body>
    </html>
  );
}
