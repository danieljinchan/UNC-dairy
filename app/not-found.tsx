import Link from "next/link";

export default function NotFound() {
  return (
    <div className="unc-card p-10 text-center">
      <h1 className="text-2xl font-bold text-navy">Not found</h1>
      <p className="mt-2 text-sm text-navy/55">
        The record you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-5 inline-block rounded-full bg-navy px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-mid-blue"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
