import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-3xl font-bold tracking-tight text-zinc-100 mb-2">Page Not Found</h2>
      <p className="text-zinc-400 text-sm mb-6 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs rounded-xl transition-colors"
      >
        Return to Research Agent
      </Link>
    </div>
  );
}
