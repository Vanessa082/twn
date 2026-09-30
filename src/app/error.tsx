"use client";

import EditorialError from "@/components/ui/EditorialError";

export default function RootError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="content" className="flex min-h-screen flex-col justify-center bg-background">
      <EditorialError {...props} />
    </main>
  );
}
