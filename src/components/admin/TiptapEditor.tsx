"use client";

import ImageUploadField from "@/components/admin/media/ImageUploadField";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import {
  EditorContent,
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import {
  Bold,
  Check,
  Code,
  Copy,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Strikethrough,
  Table as TableIcon,
  Terminal,
  Trash2,
  Unlink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FigureImage, MAX_ALT_LENGTH, MAX_CAPTION_LENGTH } from "./editor/FigureImage";

// ── Lowlight instance with all common languages ───────────────────────────────
const lowlight = createLowlight(common);

// ── Code Block NodeView ───────────────────────────────────────────────────────
// Renders a VS Code-style code block with:
//   · Language label (top-left)   auto-detected by lowlight or manually set
//   · Copy-to-clipboard button (top-right)
//   · Real syntax-highlighted code via NodeViewContent
// biome-ignore lint/suspicious/noExplicitAny: Tiptap NodeViewRendererProps
function CodeBlockNodeView({ node, updateAttributes, extension }: any) {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language || "plaintext";

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <NodeViewWrapper className="relative my-6 group/codeblock">
      {/* VS Code-style header bar */}
      <div
        style={{ background: "#1a1a1a" }}
        className="flex items-center justify-between px-4 py-2 rounded-t-xl border border-b-0 border-[#2d2d2d] select-none"
      >
        {/* Language selector   click to change */}
        <select
          value={language}
          onChange={(e) => updateAttributes({ language: e.target.value })}
          style={{
            background: "transparent",
            color: "#858585",
            fontSize: "0.72rem",
            fontFamily: "ui-monospace, monospace",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            border: "none",
            outline: "none",
            cursor: "pointer",
            appearance: "none",
          }}
        >
          {[
            "plaintext",
            "javascript",
            "typescript",
            "python",
            "bash",
            "shell",
            "css",
            "html",
            "json",
            "markdown",
            "sql",
            "rust",
            "go",
            "java",
            "c",
            "cpp",
            "csharp",
            "php",
            "ruby",
            "swift",
            "kotlin",
            "yaml",
            "xml",
            "graphql",
          ].map((lang) => (
            <option key={lang} value={lang} style={{ background: "#1a1a1a", color: "#ccc" }}>
              {lang}
            </option>
          ))}
        </select>

        {/* Mac window dots */}
        <span
          style={{
            display: "flex",
            gap: "6px",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
        </span>

        {/* Copy button */}
        <button
          type="button"
          onClick={handleCopy}
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px" }}
          title="Copy code"
        >
          {copied ? (
            <Check style={{ width: 14, height: 14, color: "#27c93f" }} />
          ) : (
            <Copy style={{ width: 14, height: 14, color: "#858585" }} />
          )}
        </button>
      </div>

      {/* Code content   lowlight injects syntax colour classes */}
      <pre
        style={{
          background: "#1e1e1e",
          borderRadius: "0 0 0.75rem 0.75rem",
          border: "1px solid #2d2d2d",
          borderTop: "none",
          margin: 0,
          padding: "1.1rem 1.4rem 1.25rem",
          overflowX: "auto",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.4)",
        }}
      >
        <NodeViewContent
          as="div"
          style={{
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "0.875rem",
            lineHeight: 1.7,
            color: "#d4d4d4",
            display: "block",
            whiteSpace: "pre",
          }}
        />
      </pre>
    </NodeViewWrapper>
  );
}

// ── Editor Props ─────────────────────────────────────────────────────────────
interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TiptapEditor({
  content,
  onChange,
  placeholder = "Start writing your article...",
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Disable StarterKit's built-in codeBlock   CodeBlockLowlight replaces it
        codeBlock: false,
      }),
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockNodeView);
        },
      }).configure({ lowlight }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-ink-accent font-semibold underline underline-offset-4 decoration-ink-accent/40 hover:decoration-ink-accent transition-colors cursor-pointer",
        },
      }),
      FigureImage,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        // "tiptap" class is required so our .tiptap ul/.tiptap blockquote CSS selectors fire
        class:
          "tiptap min-h-[400px] px-4 py-3 text-foreground bg-card rounded-b-lg border-x border-b border-border focus:outline-none focus:ring-1 focus:ring-ring leading-relaxed text-base",
      },
    },
  });

  // Custom Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Table menu
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const tableMenuRef = useRef<HTMLDivElement>(null);

  // Close table menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (tableMenuRef.current && !tableMenuRef.current.contains(e.target as Node)) {
        setIsTableMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [isDecorative, setIsDecorative] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Keep editor content in sync with external content resets
  useEffect(() => {
    if (editor && content !== editor.getHTML() && editor.isEmpty) {
      editor.commands.setContent(content);
    }
  }, [editor, content]);

  if (!editor) {
    return (
      <div className="w-full h-[450px] rounded-lg border border-border bg-card animate-pulse flex items-center justify-center text-muted-foreground text-sm">
        Loading editor...
      </div>
    );
  }

  const openLinkModal = () => {
    const previousUrl = editor.getAttributes("link").href || "";
    setLinkUrl(previousUrl);
    setIsLinkModalOpen(true);
  };

  const openImageModal = () => {
    setImageSrc("");
    setImageAlt("");
    setImageCaption("");
    setIsDecorative(false);
    setImageError(null);
    setIsImageModalOpen(true);
  };

  const insertImage = () => {
    const src = imageSrc.trim();
    if (!src) {
      setImageError("Upload an image or paste its web address first.");
      return;
    }
    const alt = imageAlt.trim();
    if (!alt && !isDecorative) {
      setImageError("Describe the image for readers who can't see it, or mark it as decorative.");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "image",
        attrs: {
          src,
          alt: isDecorative ? "" : alt.slice(0, MAX_ALT_LENGTH),
          caption: imageCaption.trim().slice(0, MAX_CAPTION_LENGTH) || null,
        },
      })
      .run();
    setIsImageModalOpen(false);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border">
      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-muted/50 p-2 border-b border-border select-none">
        {/* Formatting */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("bold") ? "bg-card text-foreground font-bold shadow-sm" : ""
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("italic") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("strike") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* Headings */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* Lists */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("bulletList") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("orderedList") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* Blocks */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("blockquote") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("codeBlock") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Code Block"
        >
          <Terminal className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("code") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </button>

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Divider"
        >
          <Minus className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* Table */}
        <div className="relative" ref={tableMenuRef}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setIsTableMenuOpen((v) => !v)}
            className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 ${
              editor.isActive("table")
                ? "bg-muted-gold/20 text-foreground font-semibold shadow-sm border border-muted-gold/30"
                : ""
            }`}
            title="Table Actions"
          >
            <TableIcon className="h-4 w-4 text-muted-gold" />
            <span className="text-xs font-semibold hidden sm:inline">Table</span>
          </button>

          {isTableMenuOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-xl shadow-2xl py-1.5 min-w-[210px] animate-in fade-in duration-150">
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Insert Preset
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
                    .run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <TableIcon className="h-3.5 w-3.5 text-muted-gold" />2 × 2 Table
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <TableIcon className="h-3.5 w-3.5 text-muted-gold" />3 × 3 Table
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows: 4, cols: 4, withHeaderRow: true })
                    .run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              >
                <TableIcon className="h-3.5 w-3.5 text-muted-gold" />4 × 4 Table
              </button>

              <div className="my-1 border-t border-border" />

              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Rows & Columns
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().addRowAfter().run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                + Add row below
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().addRowBefore().run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                + Add row above
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().addColumnAfter().run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                + Add column right
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().addColumnBefore().run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                + Add column left
              </button>

              <div className="my-1 border-t border-border" />

              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().deleteRow().run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                − Delete current row
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().deleteColumn().run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-1.5 text-xs text-destructive hover:bg-destructive/10 transition-colors"
              >
                − Delete current column
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  editor.chain().focus().deleteTable().run();
                  setIsTableMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete Entire Table
              </button>
            </div>
          )}
        </div>

        {/* Table Quick Controls   Shown when focused inside a table */}
        {editor.isActive("table") && (
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mr-1 select-none">
              Table:
            </span>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-2 py-0.5 text-xs bg-card hover:bg-muted border border-border rounded text-foreground transition-colors"
              title="Add row below"
            >
              + Row
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-2 py-0.5 text-xs bg-card hover:bg-muted border border-border rounded text-foreground transition-colors"
              title="Add column right"
            >
              + Col
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-2 py-0.5 text-xs bg-card hover:bg-destructive/20 border border-border rounded text-destructive transition-colors"
              title="Delete row"
            >
              − Row
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-2 py-0.5 text-xs bg-card hover:bg-destructive/20 border border-border rounded text-destructive transition-colors"
              title="Delete column"
            >
              − Col
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-2 py-0.5 text-xs bg-destructive text-white rounded hover:bg-destructive/90 transition-colors flex items-center gap-1 font-semibold ml-1"
              title="Delete table"
            >
              <Trash2 className="h-3 w-3" /> Remove Table
            </button>
          </div>
        )}

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* Links and Images */}
        <button
          type="button"
          onClick={openLinkModal}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("link") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Insert Link"
        >
          <Link2 className="h-4 w-4" />
        </button>

        {editor.isActive("link") && (
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetLink().run()}
            className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors text-destructive hover:bg-destructive/10"
            title="Remove Link"
          >
            <Unlink className="h-4 w-4" />
          </button>
        )}

        <button
          type="button"
          onClick={openImageModal}
          className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Insert Image"
        >
          <ImageIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Insert / Edit Link</h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>
            <div className="space-y-2">
              <label
                htmlFor="modal-link-url"
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
              >
                Link URL
              </label>
              <input
                id="modal-link-url"
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              {editor.isActive("link") && (
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().extendMarkRange("link").unsetLink().run();
                    setIsLinkModalOpen(false);
                  }}
                  className="px-4 h-10 rounded-lg text-xs font-semibold border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors"
                >
                  Remove Link
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (linkUrl.trim()) {
                    editor
                      .chain()
                      .focus()
                      .extendMarkRange("link")
                      .setLink({ href: linkUrl.trim() })
                      .run();
                  } else {
                    editor.chain().focus().extendMarkRange("link").unsetLink().run();
                  }
                  setIsLinkModalOpen(false);
                }}
                className="px-4 h-10 rounded-lg text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md max-h-[90dvh] overflow-y-auto p-6 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-sm text-foreground">Insert Image</h3>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <ImageUploadField
                label="Image"
                description="Every image in a note is shown at the same 16:9 shape."
                purpose="inline"
                aspectClassName="aspect-video"
                value={imageSrc}
                onChange={(url) => {
                  setImageSrc(url);
                  setImageError(null);
                }}
                allowUrl
              />

              <div className="space-y-3 border-t border-border pt-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-image-alt"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Image description (alt text)
                  </label>
                  <input
                    id="modal-image-alt"
                    type="text"
                    value={imageAlt}
                    maxLength={MAX_ALT_LENGTH}
                    disabled={isDecorative}
                    onChange={(e) => setImageAlt(e.target.value)}
                    placeholder="What does the image show?"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={isDecorative}
                      onChange={(e) => setIsDecorative(e.target.checked)}
                    />
                    Purely decorative (screen readers will skip it)
                  </label>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="modal-image-caption"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Caption (optional)
                  </label>
                  <input
                    id="modal-image-caption"
                    type="text"
                    value={imageCaption}
                    maxLength={MAX_CAPTION_LENGTH}
                    onChange={(e) => setImageCaption(e.target.value)}
                    placeholder="A label or credit shown under the image"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                  />
                </div>
              </div>
            </div>

            {imageError && (
              <p role="alert" className="text-xs font-semibold text-destructive">
                {imageError}
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={!imageSrc}
                onClick={insertImage}
                className="px-4 h-10 rounded-lg text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                Insert image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
