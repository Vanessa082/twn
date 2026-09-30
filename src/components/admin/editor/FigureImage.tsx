"use client";

import Image from "@tiptap/extension-image";
import type { DOMOutputSpec } from "@tiptap/pm/model";
import { type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { AlertTriangle, Trash2 } from "lucide-react";

export const MAX_ALT_LENGTH = 250;
export const MAX_CAPTION_LENGTH = 300;

function ImageFigureView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const alt: string = node.attrs.alt ?? "";
  const caption: string = node.attrs.caption ?? "";
  const missingAlt = alt.trim().length === 0;

  return (
    <NodeViewWrapper
      as="figure"
      className={`group relative my-8 rounded-lg ${selected ? "ring-2 ring-ring ring-offset-4 ring-offset-card" : ""}`}
      data-drag-handle
    >
      <button
        type="button"
        onClick={deleteNode}
        aria-label="Remove image"
        className="absolute right-2 top-2 z-10 flex size-8 items-center justify-center rounded-full bg-destructive text-white opacity-0 shadow-lg transition-opacity hover:bg-destructive/90 focus:opacity-100 group-hover:opacity-100"
      >
        <Trash2 className="size-3.5" />
      </button>

      <img src={node.attrs.src} alt={alt} className="w-full rounded-lg border border-border" />

      <div contentEditable={false} className="mt-3 space-y-2">
        <label className="block">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Image description (alt text)
            {missingAlt && (
              <span className="inline-flex items-center gap-1 normal-case tracking-normal text-amber-600">
                <AlertTriangle className="size-3" aria-hidden="true" /> needed for screen readers &
                SEO
              </span>
            )}
          </span>
          <input
            type="text"
            value={alt}
            maxLength={MAX_ALT_LENGTH}
            onChange={(event) => updateAttributes({ alt: event.target.value })}
            placeholder="What does this image show? e.g. Vanessa presenting at a robotics workshop"
            className={`mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
              missingAlt ? "border-amber-500/60" : "border-border"
            }`}
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Caption (shown under the image, optional)
          </span>
          <input
            type="text"
            value={caption}
            maxLength={MAX_CAPTION_LENGTH}
            onChange={(event) => updateAttributes({ caption: event.target.value || null })}
            placeholder="Add a label or credit, e.g. The first NAO class, Lagos 2024"
            className="mt-1 h-9 w-full rounded-md border border-border bg-background px-3 font-serif text-sm italic text-foreground placeholder:not-italic placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </label>
      </div>
    </NodeViewWrapper>
  );
}

/**
 * Block image that serialises to semantic HTML:
 *   <figure><img src alt><figcaption>caption</figcaption></figure>
 * Older content with bare <img> tags keeps parsing.
 */
export const FigureImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      caption: {
        default: null,
        parseHTML: (element) =>
          element.closest("figure")?.querySelector("figcaption")?.textContent?.trim() || null,
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure",
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector("img");
          if (!img?.getAttribute("src")) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt"),
            title: img.getAttribute("title"),
            caption:
              (element as HTMLElement).querySelector("figcaption")?.textContent?.trim() || null,
          };
        },
      },
      { tag: "img[src]:not([src^='data:'])" },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const { caption: _caption, ...imgAttributes } = HTMLAttributes;
    const caption: string | null = node.attrs.caption;
    const img: DOMOutputSpec = [
      "img",
      { ...imgAttributes, alt: node.attrs.alt ?? "", loading: "lazy", decoding: "async" },
    ];
    return caption ? ["figure", {}, img, ["figcaption", {}, caption]] : ["figure", {}, img];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageFigureView);
  },
}).configure({ inline: false, allowBase64: false });
