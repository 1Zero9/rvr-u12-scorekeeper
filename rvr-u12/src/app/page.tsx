"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

// …(rest of your Home code, but no page-level <header> with buttons)


type RawMatch = {
  id: string;
  date: string;                 // 'YYYY-MM-DD'
  our_score: number | null;
  their_score: number | null;
  is_friendly: boolean | null;
  league_id: string | null;
  opponents?: { name: string } | { name: string }[] | null;
};

type Match = {
  id: string;
  date: string;
  our: number;
  their: number;
  isLeague: boolean;
  opponentName: string;
};

function normalize(raw: RawMatch[]): Match[] {
  return raw.map((r) => {
    const opp = Array.isArray(r.opponents) ? r.opponents[0] ?? null : r.opponents ?? null;
    return {
      id: r.id,
      date: r.date,
      our: r.our_score ?? 0,
      their: r.their_score ?? 0,
      isLeague: !!r.league_id && !r.is_friendly,
      opponentName: opp?.name ?? "Opponent",
    };
  });
}

function resultLetter(our: number, their: number) {
  if (our > their) return "W";
  if (our < their) return "L";
  return "D";
}

export default function Home() {
  const [rows, setRows] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("matches")
        .select("id,date,our_score,their_score,is_friendly,league_id,opponents!inner(name)")
        .order("date", { ascending: false })
        .limit(25);

      if (error) {
        console.error(error);
        setRows([]);
      } else {
        setRows(normalize((data ?? []) as RawMatch[]));
      }
      setLoading(false);
    })();
  }, []);

  // --- Quick Stats (all matches) ---
  const stats = useMemo(() => {
    const played = rows.length;
    let w = 0, d = 0, l = 0, gf = 0, ga = 0;
    rows.forEach((m) => {
      gf += m.our; ga += m.their;
      const r = resultLetter(m.our, m.their);
      if (r === "W") w++; else if (r === "D") d++; else l++;
    });
    const gd = gf - ga;
    const winPct = played ? Math.round((w / played) * 100) : 0;
    return { played, w, d, l, gf, ga, gd, winPct };
  }, [rows]);

  // --- League Form: last 5 league matches, newest to oldest ---
  const leagueForm = useMemo(() => {
    const leagueMatches = rows.filter((m) => m.isLeague);
    const last5 = leagueMatches.slice(0, 5); // rows already newest-first
    return last5.map((m) => resultLetter(m.our, m.their));
  }, [rows]);

  return (
    <main className="mx-auto max-w-4xl p-4 space-y-6">
      {/* Header */}
<header className="flex items-center justify-between">
  <h1 className="mb-2 text-2xl font-semibold">RVR U12 Scorekeeper</h1>

  <nav className="flex items-center gap-3">
    <Link href="/" className="text-sm underline-offset-4 hover:underline">
      Home
    </Link>
    <Link
      href="/record-match"
      className="rounded-xl bg-orange-500 px-5 py-2 text-white hover:opacity-90"
    >
      Record Match
    </Link>
  </nav>
</header>
      {/* Quick Stats */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">Quick stats</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            <Badge label={`${stats.played} Played`} />
            <Badge label={`${stats.w}-${stats.d}-${stats.l} W-D-L`} />
            <Badge label={`${stats.gf}/${stats.ga} GF/GA`} />
            <Badge label={`${stats.gd} GD`} />
            <Badge label={`${stats.winPct} Win %`} />
          </div>
        )}
      </section>

      {/* League Form */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-base font-semibold">League form</h2>
          {!loading && leagueForm.length > 0 && (
            <div className="flex items-center gap-2">
              {leagueForm
                .slice() // already newest-first
                .reverse() // show oldest → newest so “newest on the right”
                .map((r, i) => (
                  <Bubble key={i} result={r} />
                ))}
            </div>
          )}
        </div>
        {!loading && leagueForm.length === 0 && (
          <p className="text-sm text-gray-500">No league matches yet.</p>
        )}
      </section>

      {/* Recent Matches list (unchanged but styled) */}
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold">Recent Matches</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-gray-500">No matches yet.</p>
        ) : (
          <ul className="divide-y">
            {rows.map((m) => (
              <li key={m.id} className="flex items-center justify-between py-3">
                <div className="text-sm">
                  <div className="font-medium">{m.opponentName}</div>
                  <div className="text-gray-500">{m.date}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {m.our} – {m.their}
                  </span>
                  <Dot result={resultLetter(m.our, m.their)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

/* ——— tiny UI helpers ——— */

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-2xl border px-3 py-1 text-sm">
      {label}
    </span>
  );
}

function Bubble({ result }: { result: "W" | "D" | "L" | string }) {
  const colour =
    result === "W" ? "bg-green-500" : result === "L" ? "bg-red-500" : "bg-gray-400";
  return <span className={`inline-block h-6 w-6 rounded-full ${colour}`} title={result} />;
}

function Dot({ result }: { result: "W" | "D" | "L" | string }) {
  const colour =
    result === "W" ? "bg-green-500" : result === "L" ? "bg-red-500" : "bg-gray-400";
  return <span className={`inline-block h-3 w-3 rounded-full ${colour}`} title={result} />;
}
