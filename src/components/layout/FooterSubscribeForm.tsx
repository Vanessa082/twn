"use client";

import { subscribeAction } from "@/app/actions/newsletter";
import { ArrowRight, Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

const initialState = { success: false, error: null as string | null };

/**
 * Isolated so Footer does not import newsletter Server Actions when disabled.
 */
export default function FooterSubscribeForm() {
  const [state, formAction, isPending] = useActionState(subscribeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) formRef.current.reset();
  }, [state.success]);

  return (
    <>
      <form
        ref={formRef}
        action={formAction}
        className="flex w-full max-w-[220px] items-center border border-border bg-background rounded-[6px] overflow-hidden"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@email.com"
          disabled={isPending}
          className="flex-1 h-9 px-3 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none min-w-0"
        />
        <button
          type="submit"
          disabled={isPending}
          aria-label="Subscribe"
          className="w-9 h-9 flex items-center justify-center border-l border-border hover:bg-muted text-foreground transition-colors flex-shrink-0 cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowRight className="h-3.5 w-3.5" />
          )}
        </button>
      </form>
      <div className="min-h-[14px]">
        {state.success && (
          <span className="text-[10px] text-foreground font-medium">Subscribed!</span>
        )}
        {state.error && <span className="text-[10px] text-destructive">{state.error}</span>}
      </div>
    </>
  );
}
