"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";

type MatchRow = {
  id: string;
  date: string;
  our_score: number | null;
  their_score: number | null;
  opponent_id: string | null;
  opponents?: { name: string } | null;
};

export default function Home() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("id,date,our_score,their_score,opponent_id,opponents!inner(name)")
        .order("date", { ascending: false })
        .limit(10);

      if (error) {
        console.error(error);
      } else {
        setMatches(data as MatchRow[]);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-4xl p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">RVR U12 Scorekeeper</h1>
        <Link
          href="/record-match"
          className="rounded-xl bg-orange-500 px-5 py-2 text-white hover:opacity-90"
        >
          Record Match
        </Link>
      </header>

      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">Recent Matches</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-gray-500">No matches yet.</p>
        ) : (
          <ul className="divide-y">
            {matches.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-2">
                <div className="text-sm">
                  <div className="font-medium">
                    {m.opponents?.name ?? "Opponent"}
                  </div>
                  <div className="text-gray-500">{m.date}</div>
                </div>
                <div className="text-sm font-semibold">
                  {m.our_score ?? 0} – {m.their_score ?? 0}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
