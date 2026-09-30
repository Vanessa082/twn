"use client";

import { Eyebrow } from "@/components/ui/SectionHeading";
import type { AboutFiguringOutItem } from "@/modules/site/contracts";
import { Plus } from "lucide-react";
import { useId, useState } from "react";

interface StillFiguringItOutSectionProps {
  items: AboutFiguringOutItem[];
}

export default function StillFiguringItOutSection({ items }: StillFiguringItOutSectionProps) {
  const baseId = useId();
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleIndex = (index: number) => {
    setOpenIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section
      id="still-figuring-it-out"
      className="scroll-mt-24 border-b border-border bg-background py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <Eyebrow>Unanswered questions</Eyebrow>
              <h2
                className="mt-4 font-serif font-bold leading-[1.1] tracking-[-0.02em] text-foreground"
                style={{ fontSize: "clamp(1.9rem, 3.6vw, 2.75rem)" }}
              >
                Still figuring it out
              </h2>
              <p className="mt-4 max-w-sm text-[15px] leading-[1.75] text-muted-foreground">
                A notebook is as much about what I don&rsquo;t know yet as what I have already
                shipped. Open any question to read where I am with it.
              </p>
            </div>
          </div>

          <ul className="border-t border-border lg:col-span-8">
            {items.map((item, idx) => {
              const isOpen = openIndices.includes(idx);
              const panelId = `${baseId}-panel-${idx}`;
              return (
                <li key={item.question} className="border-b border-border">
                  <h3>
                    <button
                      type="button"
                      onClick={() => toggleIndex(idx)}
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      className="group flex w-full cursor-pointer items-start justify-between gap-6 py-6 text-left"
                    >
                      <span className="flex-1">
                        {item.tag && (
                          <span className="block text-[10px] font-sans font-semibold uppercase tracking-[0.22em] text-ink-accent">
                            {item.tag}
                          </span>
                        )}
                        <span className="mt-2 block font-serif text-[1.3rem] font-bold leading-snug text-foreground transition-opacity duration-300 group-hover:opacity-70">
                          {item.question}
                        </span>
                      </span>
                      <Plus
                        className={`mt-6 size-4 shrink-0 text-muted-foreground transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:text-foreground ${
                          isOpen ? "rotate-45" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                    inert={!isOpen}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-8 font-serif text-[1.05rem] leading-[1.8] text-foreground/80">
                        {item.reflection}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
