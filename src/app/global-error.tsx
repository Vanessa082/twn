"use client";

/**
 * Last-resort boundary for failures in the root layout itself. It replaces the
 * whole document, so it cannot rely on globals.css, fonts or providers.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fff",
          color: "#111",
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "2rem",
        }}
      >
        <main role="alert" style={{ maxWidth: 560 }}>
          <p
            style={{
              fontFamily: "system-ui, sans-serif",
              fontSize: 11,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#666",
            }}
          >
            The Notebook of a Tech Woman
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.1, margin: "1.25rem 0" }}>
            The notebook couldn&rsquo;t open.
          </h1>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: "#555" }}>
            Something failed before the page could load. Please try again in a moment.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              background: "#111",
              color: "#fff",
              border: 0,
              padding: "0.8rem 1.5rem",
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          {error.digest && (
            <p
              style={{ marginTop: "2.5rem", fontFamily: "monospace", fontSize: 11, color: "#888" }}
            >
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
