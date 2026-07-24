"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Strikethrough,
  Terminal,
  Unlink,
} from "lucide-react";
import { useEffect, useState } from "react";

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
        heading: {
          levels: [2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class:
              "rounded-lg bg-muted p-4 font-mono text-xs sm:text-sm text-foreground overflow-x-auto my-4",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-ink-accent font-semibold underline underline-offset-4 decoration-ink-accent/40 hover:decoration-ink-accent transition-colors cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full my-6 mx-auto border border-border shadow-md",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px] px-4 py-3 text-foreground bg-card rounded-b-lg border-x border-b border-border focus:ring-1 focus:ring-ring font-serif leading-relaxed",
      },
    },
  });

  // Custom Modals
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Keep editor content in sync with external content resets (e.g. initialData hydration)
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
    setImageUrl("");
    setUploadError(null);
    setIsImageModalOpen(true);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-border">
      {/* Rich Text Toolbar */}
      <div className="flex flex-wrap items-center gap-1 bg-muted/50 p-2 border-b border-border select-none">
        {/* Formatting */}
        <button
          type="button"
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
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 ${
            editor.isActive("heading", { level: 2 }) ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 ${
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
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors ${
            editor.isActive("orderedList") ? "bg-card text-foreground shadow-sm" : ""
          }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="h-4 w-[1px] bg-border mx-1" />

        {/* Blocks */}
        <button
          type="button"
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
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </button>

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
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-200">
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
          <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-200">
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
              {/* Device upload */}
              <div className="space-y-2">
                <label
                  htmlFor="modal-image-upload"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground block"
                >
                  Upload from device
                </label>
                <div className="border-2 border-dashed border-border hover:border-muted-gold rounded-xl p-6 transition-colors text-center relative cursor-pointer">
                  <input
                    id="modal-image-upload"
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      setUploadError(null);
                      const formData = new FormData();
                      formData.append("file", file);
                      try {
                        const { uploadImageAction } = await import("@/app/actions/upload");
                        const res = await uploadImageAction(formData);
                        if (res.success && res.url) {
                          editor.chain().focus().setImage({ src: res.url }).run();
                          setIsImageModalOpen(false);
                        } else {
                          setUploadError(res.error || "Upload failed");
                        }
                      } catch (err) {
                        console.error("Upload error:", err);
                        setUploadError("An error occurred during file upload.");
                      } finally {
                        setIsUploading(false);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {isUploading ? (
                    <div className="space-y-2 py-2">
                      <Loader2 className="h-6 w-6 text-muted-gold animate-spin mx-auto" />
                      <p className="text-xs text-muted-foreground">Uploading image...</p>
                    </div>
                  ) : (
                    <div className="space-y-1 py-2">
                      <ImageIcon className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-foreground font-medium">
                        Click to select an image
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Supports PNG, JPG, WebP up to 5MB
                      </p>
                    </div>
                  )}
                </div>
                {uploadError && (
                  <p className="text-xs text-destructive mt-1 font-semibold">{uploadError}</p>
                )}
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-border" />
                <span className="flex-shrink mx-4 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                  or
                </span>
                <div className="flex-grow border-t border-border" />
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <label
                  htmlFor="modal-image-url"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Image Web URL
                </label>
                <input
                  id="modal-image-url"
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  if (imageUrl.trim()) {
                    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
                  }
                  setIsImageModalOpen(false);
                }}
                className="px-4 h-10 rounded-lg text-xs font-semibold bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                Insert Web Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
