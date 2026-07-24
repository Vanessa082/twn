"use client";

import { CheckCircle, XCircle } from "lucide-react";
import { useCallback, useState } from "react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = "success") => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const showError = useCallback((message: string) => show(message, "error"), [show]);
  const showSuccess = useCallback((message: string) => show(message, "success"), [show]);

  return { toasts, showError, showSuccess };
}

interface ToastContainerProps {
  toasts: Toast[];
}

export function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-lg text-sm font-medium max-w-xs animate-fade-in ${
            t.type === "success"
              ? "bg-emerald-950 border-emerald-700/40 text-emerald-300"
              : "bg-red-950 border-red-700/40 text-red-300"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-red-400" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
