"use client";

import { useEffect, useRef } from "react";

interface ArticleRendererProps {
  html: string;
  className?: string;
}

export function ArticleRenderer({ html, className }: ArticleRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Process all <pre> code blocks to add standard VS Code headers & copy buttons
    const preElements = containerRef.current.querySelectorAll("pre");

    preElements.forEach((pre) => {
      // Prevent double wrapping
      if (pre.dataset.enhanced === "true" || pre.parentElement?.classList.contains("code-block-wrapper")) {
        return;
      }

      // Detect language from code class (e.g. language-python -> PYTHON)
      const codeEl = pre.querySelector("code") || pre;
      let language = "PLAINTEXT";
      const classList = Array.from(codeEl.classList);
      const langClass = classList.find((c) => c.startsWith("language-"));
      if (langClass) {
        language = langClass.replace("language-", "").toUpperCase();
      }

      // Remove any legacy saved header markup nested inside
      const legacyHeaders = pre.querySelectorAll(".code-header, select, button");
      legacyHeaders.forEach((el) => el.remove());

      pre.dataset.enhanced = "true";

      // 1. Create code block container
      const wrapper = document.createElement("div");
      wrapper.className =
        "code-block-wrapper relative my-6 rounded-xl overflow-hidden border border-[#2d2d2d] shadow-2xl bg-[#1e1e1e]";

      // 2. Create VS Code header bar
      const header = document.createElement("div");
      header.className =
        "flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-[#2d2d2d] text-xs font-mono select-none";

      // Left group (Mac window controls + Language badge)
      const leftGroup = document.createElement("div");
      leftGroup.className = "flex items-center gap-3";
      leftGroup.innerHTML = `
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block"></span>
          <span class="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block"></span>
        </div>
        <span class="text-[#9cdcfe] font-semibold text-[11px] uppercase tracking-wider">${language}</span>
      `;

      // Right group (Copy button)
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className =
        "flex items-center gap-1.5 px-2.5 py-1 rounded text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs cursor-pointer";
      copyBtn.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 2 01-2-2V6a2 2 2 012-2h8a2 2 2 012 2v2m-6 12h8a2 2 2 012-2v-8a2 2 2 01-2-2h-8a2 2 2 01-2 2v8a2 2 2 012 2z"></path></svg>
        <span>Copy</span>
      `;

      copyBtn.addEventListener("click", async () => {
        const textToCopy = codeEl.innerText || pre.innerText;
        try {
          await navigator.clipboard.writeText(textToCopy);
          copyBtn.innerHTML = `
            <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span class="text-emerald-400 font-medium">Copied ✓</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 2 01-2-2V6a2 2 2 012-2h8a2 2 2 012 2v2m-6 12h8a2 2 2 012-2v-8a2 2 2 01-2-2h-8a2 2 2 01-2 2v8a2 2 012 2z"></path></svg>
              <span>Copy</span>
            `;
          }, 2000);
        } catch (err) {
          console.error("Failed to copy code block: ", err);
        }
      });

      header.appendChild(leftGroup);
      header.appendChild(copyBtn);

      // Reset pre element margin and border
      pre.style.margin = "0";
      pre.style.borderRadius = "0 0 0.75rem 0.75rem";
      pre.style.background = "#1e1e1e";
      pre.style.padding = "1.2rem 1.4rem";
      pre.style.border = "none";

      // Insert wrapper in DOM
      if (pre.parentNode) {
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(header);
        wrapper.appendChild(pre);
      }
    });
  }, [html]);

  return (
    <div
      ref={containerRef}
      className={className}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized article content HTML
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
