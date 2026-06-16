"use client";

/**
 * 🧠 LEARNING POINT: Client Component ("use client")
 * We declare this file with "use client" at the very top. 
 * Why? Because it handles user interactions, maintains component state (via useRef/useEffect), 
 * and relies on browser APIs.
 * Next.js pre-renders this component to HTML on the server (SSR), and then "hydrates" it 
 * in the browser with interactive JavaScript events.
 */

import { useActionState, useEffect, useRef } from "react";
import { subscribeAction } from "@/app/actions/newsletter";
import { useTranslations } from "next-intl";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const initialState = {
  success: false,
  error: null as string | null,
};

export default function NewsletterSection() {
  const t = useTranslations("home.newsletter");

  /**
   * 🧠 LEARNING POINT: React 19 useActionState Hook
   * This is a brand new hook in React 19 / Next.js 15 for managing forms and server actions.
   * - `subscribeAction` is the Server Action that executes on the server when the form is submitted.
   * - `state` holds the outcome returned by the Server Action (e.g., success status, error messages).
   * - `formAction` is the function we pass to the HTML <form action={...}> attribute.
   * - `isPending` is a boolean automatically managed by React that becomes `true` while the 
   *   asynchronous server request is in-flight, allowing us to display loading indicators.
   */
  const [state, formAction, isPending] = useActionState(subscribeAction, initialState);
  
  // We use a React Ref to hold a direct pointer to the HTML Form element in the DOM
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * 🧠 LEARNING POINT: Side Effects (useEffect)
   * The server operation completes asynchronously. When `state.success` toggles to `true`, 
   * we want to clear the input field in the browser. 
   * Checking `state.success` as a dependency triggers this callback, resetting the form 
   * safely only after verification.
   */
  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset(); // Native DOM form reset
    }
  }, [state.success]);

  return (
    <section className="py-20 bg-background text-foreground border-b border-border transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex p-3 border border-foreground/10 bg-foreground/5 text-foreground mb-6">
          <Mail className="h-6 w-6" />
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-tight mb-4 text-foreground uppercase">
          {t("title")}
        </h2>

        <p className="text-muted-foreground max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
          {t("description")}
        </p>

        {/* 
          Form Submission:
          We wire the form action to `formAction`. React automatically intercepts this, 
          performs progressive enhancement (submits even if JS hasn't fully loaded yet!),
          and sends data to our Server Action.
        */}
        <form
          ref={formRef}
          action={formAction}
          className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 items-stretch justify-center"
        >
          <div className="relative flex-1">
            <input
              type="email"
              name="email"
              required
              placeholder={t("placeholder")}
              disabled={isPending}
              className="w-full h-12 px-4 border border-foreground/30 bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground disabled:opacity-70 transition-all text-sm rounded-none"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="h-12 px-6 bg-foreground text-background border-2 border-foreground hover:bg-background hover:text-foreground font-bold tracking-wider uppercase text-xs transition-all duration-300 disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("cta")}...
              </>
            ) : (
              t("cta")
            )}
          </button>
        </form>

        {/* Status Messages */}
        <div className="max-w-md mx-auto mt-4 h-6">
          {state.success && (
            <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="h-4 w-4" />
              <span>{t("success")}</span>
            </div>
          )}

          {state.error && (
            <div className="inline-flex items-center gap-2 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-4 w-4" />
              <span>{state.error}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
