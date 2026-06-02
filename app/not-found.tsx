import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="label-caps text-terra">404</p>
      <h1 className="mt-4 font-serif text-5xl font-medium text-green">Page not found</h1>
      <p className="mt-4 max-w-md text-muted">
        This path doesn&apos;t exist — but your next ritual is waiting in our collections.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-terra px-8 py-4 text-sm label-caps text-white hover:bg-terra-2"
          style={{ borderRadius: 0 }}
        >
          Home
        </Link>
        <Link
          href="/collections"
          className="inline-flex items-center justify-center border border-green/30 px-8 py-4 text-sm label-caps text-green hover:border-green"
          style={{ borderRadius: 0 }}
        >
          Shop collections
        </Link>
      </div>
    </section>
  );
}
