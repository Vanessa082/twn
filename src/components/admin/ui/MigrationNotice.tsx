import { Database } from "lucide-react";

interface MigrationNoticeProps {
  table: string;
  migrationFile: string;
}

/** Shown in place of an admin editor when its table has not been created in Supabase yet. */
export default function MigrationNotice({ table, migrationFile }: MigrationNoticeProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 text-sm">
      <Database className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">
          The <code className="font-mono text-xs">{table}</code> table doesn&apos;t exist yet.
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Open the Supabase dashboard → SQL Editor, paste the contents of{" "}
          <code className="font-mono">{migrationFile}</code> and run it. Then reload this page.
          Nothing you publish here can be saved until then.
        </p>
      </div>
    </div>
  );
}
