
import NoteCard from "./NoteCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { routes } from "@/lib/site";
import type { NoteCard as NoteCardType } from "@/modules/editorial/contracts";
interface RelatedNotesProps {
  notes: NoteCardType[];
}

export default function RelatedNotes({ notes }: RelatedNotesProps) {
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="related-notes" className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <SectionHeading
          eyebrow="Keep reading"
          title={<span id="related-notes">More from the notebook</span>}
          action={{ label: "All notes", href: routes.notebook }}
        />
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      </div>
    </section>
  );
}
