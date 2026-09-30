"use client";

import EditorialError from "@/components/ui/EditorialError";

export default function PublicError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <EditorialError {...props} />;
}
