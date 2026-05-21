import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
      <h1 className="text-xl font-bold text-slate-900">Not found</h1>
      <p className="mt-2 text-sm text-slate-500">
        The record you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
