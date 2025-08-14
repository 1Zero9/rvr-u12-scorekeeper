"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Heading */}
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">RVR Matchday</h1>
          <p className="mt-2 text-gray-600">
            Welcome to the match management dashboard.
          </p>
        </header>

        {/* Links / Actions */}
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Link
            href="/record-match"
            className="rounded-xl border bg-white p-6 shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">Record Match</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add match info, goals, and assists.
            </p>
          </Link>

          <Link
            href="/matches"
            className="rounded-xl border bg-white p-6 shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">View Matches</h2>
            <p className="mt-1 text-sm text-gray-500">
              Browse match history and stats.
            </p>
          </Link>

          <Link
            href="/players"
            className="rounded-xl border bg-white p-6 shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">Manage Players</h2>
            <p className="mt-1 text-sm text-gray-500">
              Add, edit, or remove players.
            </p>
          </Link>

          <Link
            href="/opponents"
            className="rounded-xl border bg-white p-6 shadow hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">Manage Opponents</h2>
            <p className="mt-1 text-sm text-gray-500">
              Maintain opponent team info.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
