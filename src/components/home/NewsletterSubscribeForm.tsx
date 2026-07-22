"use client";

import { subscribeAction } from "@/app/actions/newsletter";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

const initialState = { success: false, error: null as string | null };

/**
 * Isolated subscribe UI — only loaded when NEWSLETTER_ENABLED is true.
 */
export default function NewsletterSubscribeForm() {
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
        className="flex w-full max-w-md flex-row items-center"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="you@email.com"
          disabled={isPending}
          className="flex-1 h-11 px-4 border border-border border-r-0 bg-background text-foreground text-xs placeholder:text-muted-foreground/70 focus:outline-none focus:border-foreground/40 transition-colors disabled:opacity-60 rounded-l-[8px]"
        />
        <button
          type="submit"
          disabled={isPending}
          data-cursor="button"
          className="h-11 px-6 bg-foreground text-background text-[10px] font-sans font-bold uppercase tracking-[0.18em] hover:bg-foreground/85 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shrink-0 rounded-r-[8px] border border-foreground cursor-pointer"
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Subscribe"}
        </button>
      </form>
      <div className="min-h-[16px] text-center md:text-right w-full px-2">
        {state.success && (
          <div className="inline-flex items-center gap-1.5 text-[11px] text-foreground font-medium">
            <CheckCircle2 className="h-3 w-3 text-[#AE8D64]" />
            <span>Subscribed successfully!</span>
          </div>
        )}
        {state.error && <p className="text-[11px] text-destructive">{state.error}</p>}
      </div>
    </>
  );
}
