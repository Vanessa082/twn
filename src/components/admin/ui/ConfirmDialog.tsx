"use client";

import { useCallback, useState } from "react";

interface ConfirmDialogOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
}

interface ConfirmDialogState extends ConfirmDialogOptions {
  resolve: (value: boolean) => void;
}

export function useConfirm() {
  const [dialog, setDialog] = useState<ConfirmDialogState | null>(null);

  const confirm = useCallback(
    (opts: ConfirmDialogOptions): Promise<boolean> =>
      new Promise((resolve) => {
        setDialog({ ...opts, resolve });
      }),
    []
  );

  const handleClose = (result: boolean) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  const ConfirmDialog = dialog ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs"
      onClick={() => handleClose(false)}
    >
      <div
        className="w-full max-w-sm bg-card border border-border rounded-xl shadow-xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {dialog.title && (
          <h3 className="font-serif font-bold text-lg text-foreground">{dialog.title}</h3>
        )}
        <p className="text-sm text-muted-foreground">{dialog.message}</p>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={() => handleClose(false)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-border text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleClose(true)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
              dialog.danger
                ? "bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20"
                : "bg-foreground text-background hover:bg-foreground/80"
            }`}
          >
            {dialog.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmDialog };
}
