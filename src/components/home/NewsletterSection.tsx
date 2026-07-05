"use client";

/**
 * NewsletterSection — Single horizontal card matching design image.
 *
 * Layout:
 *   - Container: max-w-7xl px-5 sm:px-10 lg:px-20 py-14 sm:py-20
 *   - Card: rounded-[20px], bg-white, border border-[#ECECEC], p-8 sm:p-10 md:py-8
 *   - Three sections:
 *     - Left: envelope illustration (minimal outline box)
 *     - Center: heading "Get new notes in your inbox" (font-serif, weight 700) + subtext
 *     - Right: inline email input + black SUBSCRIBE button
 */

import { subscribeAction } from "@/app/actions/newsletter";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

const initialState = { success: false, error: null as string | null };

export default function NewsletterSection() {
  const [state, formAction, isPending] = useActionState(subscribeAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) formRef.current.reset();
  }, [state.success]);

  return (
    <section
      id="newsletter"
      aria-label="Newsletter signup"
      className="py-14 bg-background border-b border-[#ECECEC]"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        
        {/* Horizontal Card */}
        <div className="bg-white border border-[#ECECEC] rounded-[20px] p-6 sm:p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          
          {/* Left: Envelope Icon */}
          <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 border border-[#ECECEC] text-[#6B6B6B] rounded-[12px] bg-[#F9F9F7]">
            <Mail className="h-6 w-6" strokeWidth={1.5} />
          </div>

          {/* Center: Heading & Subtitle */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-xl sm:text-2xl font-serif font-black tracking-tight text-foreground leading-[1.25]">
              Get new notes in your inbox
            </h2>
            <p className="text-xs text-[#6B6B6B] mt-1.5 leading-relaxed">
              Receive new articles directly. No spam, unsubscribe anytime.
            </p>
          </div>

          {/* Right: Input & Subscribe button */}
          <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-2">
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
                className="flex-1 h-11 px-4 border border-[#ECECEC] border-r-0 bg-background text-foreground text-xs placeholder:text-[#9B9B9B] focus:outline-none focus:border-foreground/40 transition-colors disabled:opacity-60 rounded-l-[8px]"
              />
              <button
                type="submit"
                disabled={isPending}
                data-cursor="button"
                className="h-11 px-6 bg-foreground text-background text-[10px] font-sans font-bold uppercase tracking-[0.18em] hover:bg-foreground/85 transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shrink-0 rounded-r-[8px] border border-foreground cursor-pointer"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  "Subscribe"
                )}
              </button>
            </form>

            {/* Status messages under input */}
            <div className="min-h-[16px] text-center md:text-right w-full px-2">
              {state.success && (
                <div className="inline-flex items-center gap-1.5 text-[11px] text-foreground font-medium animate-in fade-in duration-300">
                  <CheckCircle2 className="h-3 w-3 text-[#AE8D64]" />
                  <span>Subscribed successfully!</span>
                </div>
              )}
              {state.error && (
                <p className="text-[11px] text-destructive animate-in fade-in duration-300">{state.error}</p>
              )}
            </div>
          </div>

        </div>
        
      </div>
    </section>
  );
}
