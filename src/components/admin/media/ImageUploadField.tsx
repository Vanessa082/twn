"use client";

import { uploadImageAction } from "@/app/actions/upload";
import {
  IMAGE_ACCEPT,
  IMAGE_LIMITS_HINT,
  type ImageUploadPurpose,
  validateImageFile,
} from "@/lib/media/images";
import { safeHttpUrlSchema } from "@/lib/validation/schemas";
import { ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { type DragEvent, useId, useRef, useState } from "react";

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  purpose: ImageUploadPurpose;
  /** Tailwind aspect class for the preview, matching where the image is shown. */
  aspectClassName?: string;
  description?: string;
  /** Also accept a pasted https:// URL. */
  allowUrl?: boolean;
  /** Also accept site-relative paths such as /images/me.jpg. */
  allowRelative?: boolean;
}

/**
 * One upload control for every admin image: drag and drop or browse, instant
 * checks against the shared limits, a preview in the real display shape, and
 * replace/remove actions. The server repeats every check.
 */
export default function ImageUploadField({
  label,
  value,
  onChange,
  purpose,
  aspectClassName = "aspect-video",
  description,
  allowUrl = false,
  allowRelative = false,
}: ImageUploadFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlDraft, setUrlDraft] = useState("");

  const upload = async (file: File) => {
    const problem = validateImageFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", purpose);
      const result = await uploadImageAction(formData);
      if (result.success && result.url) onChange(result.url);
      else setError(result.error ?? "The image could not be uploaded.");
    } catch {
      setError("The upload didn't finish. Check your connection and try a smaller image.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && !isUploading) void upload(file);
  };

  const applyUrl = () => {
    const candidate = urlDraft.trim();
    if (!candidate) return;
    const isRelative = allowRelative && candidate.startsWith("/") && !candidate.startsWith("//");
    if (!isRelative && !safeHttpUrlSchema.safeParse(candidate).success) {
      setError("Enter a full image address starting with https://");
      return;
    }
    setError(null);
    setUrlDraft("");
    onChange(candidate);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        >
          {label}
        </label>
        {value && !isUploading && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setError(null);
            }}
            className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-destructive hover:underline"
          >
            <Trash2 className="size-3" aria-hidden="true" />
            Remove
          </button>
        )}
      </div>
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative w-full overflow-hidden rounded-lg border bg-muted/40 transition-colors ${aspectClassName} ${
          isDragging ? "border-foreground" : value ? "border-border" : "border-dashed border-border"
        }`}
      >
        {value ? (
          <img src={value} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1.5 p-4 text-center">
            <ImageIcon className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-xs font-medium text-foreground">Drop an image here</p>
            <p className="text-[10px] text-muted-foreground">{IMAGE_LIMITS_HINT}</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 backdrop-blur-sm">
            <Loader2 className="size-5 animate-spin text-foreground" aria-hidden="true" />
            <p className="text-xs text-muted-foreground" role="status">
              Uploading…
            </p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={IMAGE_ACCEPT}
        className="sr-only"
        disabled={isUploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Upload className="size-3.5" aria-hidden="true" />
        {value ? "Replace image" : "Upload from device"}
      </button>

      {allowUrl && (
        <div className="flex gap-2">
          <input
            type="url"
            inputMode="url"
            value={urlDraft}
            onChange={(event) => setUrlDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyUrl();
              }
            }}
            placeholder="…or paste an image URL"
            aria-label={`${label} URL`}
            className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={applyUrl}
            disabled={!urlDraft.trim()}
            className="h-9 cursor-pointer rounded-md border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
