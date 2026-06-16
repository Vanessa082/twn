"use client";

import { useActionState, useEffect, useRef } from "react";
import { contactAction } from "@/app/actions/contact";
import { useTranslations } from "next-intl";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

const initialState = {
  success: false,
  error: null as string | null,
};

export default function ContactPage() {
  const t = useTranslations("contact");
  const [state, formAction, isPending] = useActionState(contactAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success && formRef.current) {
      formRef.current.reset();
    }
  }, [state.success]);

  return (
    <div className="py-16 sm:py-24 bg-background transition-colors duration-300 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-gold mb-4 inline-block">
            Get In Touch
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Form Card */}
        <div className="p-6 sm:p-10 rounded-2xl border border-border bg-card shadow-xs">
          <form ref={formRef} action={formAction} className="space-y-6">
            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                required
                disabled={isPending}
                placeholder={t("namePlaceholder")}
                className="h-12 px-4 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 transition-all text-sm"
              />
            </div>

            {/* Email Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                required
                disabled={isPending}
                placeholder={t("emailPlaceholder")}
                className="h-12 px-4 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 transition-all text-sm"
              />
            </div>

            {/* Message Input */}
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                disabled={isPending}
                placeholder={t("messagePlaceholder")}
                className="p-4 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 transition-all text-sm resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 rounded-lg bg-deep-navy text-white hover:bg-deep-navy/90 dark:bg-muted-gold dark:text-charcoal-black dark:hover:bg-muted-gold/90 font-semibold text-sm transition-all duration-200 disabled:opacity-70 flex items-center justify-center gap-2 hover-lift shadow-sm cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  {t("submit")}...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {t("submit")}
                </>
              )}
            </button>
          </form>

          {/* Feedback messages */}
          <div className="mt-4 h-6 text-center">
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

      </div>
    </div>
  );
}
