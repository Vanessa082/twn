"use client";

import { getQueryClient } from "@/lib/query/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

export default function QueryProvider({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={getQueryClient()}>{children}</QueryClientProvider>;
}
