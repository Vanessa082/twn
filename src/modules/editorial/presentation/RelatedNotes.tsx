import SectionHeading from "@/components/ui/SectionHeading";
import { routes } from "@/lib/site";
import type { RelatedNote } from "@/modules/editorial/contracts";
import NoteCard from "./NoteCard";
import { relatedReasonLabel } from "./note-format";

interface RelatedNotesProps {
  notes: RelatedNote[];
}

export default function RelatedNotes({ notes }: RelatedNotesProps) {
  if (notes.length === 0) return null;

  return (
    <section aria-labelledby="related-notes" className="border-t border-border py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-10 lg:px-20">
        <SectionHeading
          eyebrow="Keep reading"
          title={<span id="related-notes">You may also like</span>}
          action={{ label: "All notes", href: routes.notebook }}
        />
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map(({ note, reason }) => (
            <NoteCard key={note.id} note={note} reason={relatedReasonLabel(reason)} />
          ))}
        </div>
      </div>
    </section>
  );
}
