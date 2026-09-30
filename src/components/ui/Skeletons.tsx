const container = "mx-auto w-full max-w-7xl px-5 sm:px-10 lg:px-20";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted ${className}`} />;
}

function Status({ label }: { label: string }) {
  return (
    <span role="status" className="sr-only">
      {label}
    </span>
  );
}

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <Bar className="aspect-[16/10] w-full" />
          <Bar className="mt-5 h-2.5 w-24" />
          <Bar className="mt-3 h-5 w-5/6" />
          <Bar className="mt-2 h-5 w-2/3" />
          <Bar className="mt-4 h-3 w-full" />
          <Bar className="mt-2 h-3 w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="max-w-2xl">
      <Bar className="h-2.5 w-28" />
      <Bar className="mt-6 h-12 w-3/4 sm:h-16" />
      <Bar className="mt-5 h-4 w-full" />
      <Bar className="mt-2 h-4 w-2/3" />
    </div>
  );
}

export function NotebookIndexSkeleton() {
  return (
    <div className="bg-background pb-24 pt-16 sm:pt-24">
      <Status label="Loading the notebook" />
      <div className={container}>
        <PageHeaderSkeleton />
        <div className="mb-14 mt-10 flex gap-6 border-t border-border pt-6">
          {[0, 1, 2, 3, 4].map((i) => (
            <Bar key={i} className="h-2.5 w-20" />
          ))}
        </div>
        <CardGridSkeleton />
      </div>
    </div>
  );
}

export function NoteSkeleton() {
  return (
    <div className="bg-background">
      <Status label="Opening the note" />
      <div className={container}>
        <div className="max-w-4xl pb-10 pt-10 sm:pt-16">
          <Bar className="h-2.5 w-40" />
          <Bar className="mt-7 h-10 w-full sm:h-14" />
          <Bar className="mt-3 h-10 w-3/4 sm:h-14" />
          <Bar className="mt-6 h-5 w-5/6" />
          <div className="mt-8 flex items-center gap-3">
            <Bar className="size-11 rounded-full" />
            <div>
              <Bar className="h-3 w-24" />
              <Bar className="mt-2 h-2.5 w-36" />
            </div>
          </div>
        </div>
        <Bar className="aspect-[16/10] w-full sm:aspect-[16/9]" />
        <div className="max-w-[680px] space-y-3 py-12">
          {Array.from({ length: 9 }, (_, i) => (
            <Bar key={i} className={`h-4 ${i % 4 === 3 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ListPageSkeleton({ label }: { label: string }) {
  return (
    <div className="bg-background pb-24 pt-16 sm:pt-24">
      <Status label={label} />
      <div className={container}>
        <PageHeaderSkeleton />
        <div className="mt-14 divide-y divide-border border-y border-border">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="grid grid-cols-1 gap-6 py-10 md:grid-cols-12">
              <div className="md:col-span-4">
                <Bar className="h-6 w-2/3" />
                <Bar className="mt-3 h-2.5 w-24" />
              </div>
              <div className="space-y-2 md:col-span-8">
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-5/6" />
                <Bar className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuietPageSkeleton() {
  return (
    <div className="bg-background pb-24 pt-16 sm:pt-24">
      <Status label="Turning the page" />
      <div className={container}>
        <PageHeaderSkeleton />
        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <Bar className="aspect-[4/5] w-full lg:col-span-5" />
          <div className="space-y-3 lg:col-span-7">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Bar key={i} className={`h-4 ${i === 5 ? "w-1/2" : "w-full"}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
