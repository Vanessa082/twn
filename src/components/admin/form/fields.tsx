"use client";

import ImageUploadField from "@/components/admin/media/ImageUploadField";
import type { ImageUploadPurpose } from "@/lib/media/images";
import { Eye, EyeOff } from "lucide-react";
import { useId } from "react";
import { errorMessages, useFieldContext } from "./form-context";

const inputClass =
  "w-full rounded-lg border bg-background px-3.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

function FieldErrors({ id, messages }: { id: string; messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <p id={id} role="alert" className="mt-1 text-[11px] font-semibold text-destructive">
      {messages[0]}
    </p>
  );
}

interface TextFieldProps {
  label: string;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  /** Render a textarea with this many rows. */
  rows?: number;
  type?: "text" | "url";
  /** Store an empty box as undefined, for optional fields. */
  optional?: boolean;
}

/** Labelled text input or textarea bound to a string form field. */
export function TextField({
  label,
  placeholder,
  hint,
  maxLength,
  rows,
  type = "text",
  optional = false,
}: TextFieldProps) {
  const field = useFieldContext<string | undefined>();
  const id = useId();
  const messages = errorMessages(field.state.meta.errors);
  const value = field.state.value ?? "";
  const change = (next: string) => field.handleChange(optional && !next.trim() ? undefined : next);
  const describedBy = [hint && `${id}-hint`, messages.length && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  const shared = {
    id,
    name: field.name,
    value,
    placeholder,
    maxLength,
    onBlur: field.handleBlur,
    "aria-invalid": messages.length > 0 || undefined,
    "aria-describedby": describedBy || undefined,
    className: `${inputClass} ${messages.length ? "border-destructive" : "border-border"} ${
      rows ? "py-2.5 leading-relaxed" : "h-10"
    }`,
  };

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
        {maxLength && value.length > maxLength * 0.8 && (
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {rows ? (
        <textarea {...shared} rows={rows} onChange={(e) => change(e.target.value)} />
      ) : (
        <input {...shared} type={type} onChange={(e) => change(e.target.value)} />
      )}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-[11px] text-muted-foreground">
          {hint}
        </p>
      )}
      <FieldErrors id={`${id}-error`} messages={messages} />
    </div>
  );
}

interface ImageFieldProps {
  label: string;
  purpose: ImageUploadPurpose;
  aspectClassName?: string;
  description?: string;
}

/** Cloudinary upload bound to a string (URL) form field. */
export function ImageField({ label, purpose, aspectClassName, description }: ImageFieldProps) {
  const field = useFieldContext<string>();
  const messages = errorMessages(field.state.meta.errors);
  return (
    <div>
      <ImageUploadField
        label={label}
        purpose={purpose}
        aspectClassName={aspectClassName}
        description={description}
        value={field.state.value ?? ""}
        onChange={field.handleChange}
        allowUrl
        allowRelative
      />
      <FieldErrors id={`${field.name}-error`} messages={messages} />
    </div>
  );
}

interface VisibilityFieldProps {
  title: string;
  description: string;
}

/** Card that publishes or hides a page section, bound to a boolean field. */
export function VisibilityField({ title, description }: VisibilityFieldProps) {
  const field = useFieldContext<boolean>();
  const visible = field.state.value;
  return (
    <div
      className={`flex flex-col justify-between rounded-xl border p-4 transition-all ${
        visible ? "border-border bg-background" : "border-border/50 bg-muted/40"
      }`}
    >
      <div className="mb-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-serif text-sm font-bold text-foreground">{title}</span>
          <span
            className={`rounded border px-2 py-0.5 font-sans text-[9px] font-bold uppercase tracking-wider ${
              visible
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-border bg-muted text-muted-foreground"
            }`}
          >
            {visible ? "Published" : "Hidden"}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        aria-pressed={visible}
        onClick={() => field.handleChange(!visible)}
        className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
          visible
            ? "border-border text-foreground hover:bg-muted"
            : "border-foreground bg-foreground text-background hover:bg-foreground/90"
        }`}
      >
        {visible ? (
          <>
            <EyeOff className="size-3.5" aria-hidden="true" /> Hide section
          </>
        ) : (
          <>
            <Eye className="size-3.5" aria-hidden="true" /> Publish section
          </>
        )}
      </button>
    </div>
  );
}
