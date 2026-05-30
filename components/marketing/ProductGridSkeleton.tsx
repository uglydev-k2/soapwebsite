import { Skeleton } from "@/components/ui/Skeleton";

export function ProductGridSkeleton() {
  return (
    <section className="bg-white py-20 lg:py-28" id="collections">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-green/10 bg-white">
              <Skeleton className="aspect-[3/4] w-full rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
