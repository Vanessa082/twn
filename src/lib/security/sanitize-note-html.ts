import { optimizeImageUrl } from "@/lib/media/images";
import sanitizeHtml from "sanitize-html";

/**
 * Allow-list for note bodies authored in the Tiptap editor. Anything else
 * (scripts, inline handlers, iframes, style attributes, javascript: URLs)
 * is stripped. Images always leave with an alt attribute and lazy loading.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "h2",
    "h3",
    "h4",
    "strong",
    "b",
    "em",
    "i",
    "s",
    "u",
    "mark",
    "a",
    "blockquote",
    "ul",
    "ol",
    "li",
    "code",
    "pre",
    "span",
    "figure",
    "figcaption",
    "img",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "colgroup",
    "col",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading", "decoding"],
    code: ["class"],
    pre: ["class"],
    span: ["class"],
    th: ["colspan", "rowspan", "colwidth"],
    td: ["colspan", "rowspan", "colwidth"],
    col: ["style"],
  },
  allowedClasses: {
    code: [/^language-[\w-]+$/],
    pre: [/^language-[\w-]+$/],
    span: [/^hljs(-[\w-]+)?$/],
  },
  allowedStyles: { col: { "min-width": [/^\d+px$/], width: [/^\d+px$/] } },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https", "http"] },
  allowProtocolRelative: false,
  transformTags: {
    img: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        src: optimizeImageUrl(attribs.src ?? "", { width: 2000, crop: "limit" }),
        alt: attribs.alt ?? "",
        loading: "lazy",
        decoding: "async",
      },
    }),
    a: (tagName, attribs) => {
      const external = /^https?:\/\//i.test(attribs.href ?? "");
      return {
        tagName,
        attribs: external
          ? { ...attribs, target: "_blank", rel: "noopener noreferrer" }
          : { ...attribs, target: "", rel: "" },
      };
    },
  },
};

export function sanitizeNoteHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
