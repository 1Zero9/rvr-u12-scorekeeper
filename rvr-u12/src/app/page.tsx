'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { MatchRow } from '@/lib/types';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function Home() {
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id, date, our_score, their_score, home_away,
          opponent:opponents(name),
          venue:venues(name)
        `)
        .order('date', { ascending: false });
      if (!error && data) setRows(data as unknown as MatchRow[]);
      setLoading(false);
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const played = rows.length;
    let wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
    rows.forEach(m => {
      const us = m.our_score ?? 0;
      const them = m.their_score ?? 0;
      gf += us; ga += them;
      if (us > them) wins++;
      else if (us === them) draws++;
      else losses++;
    });
    const winRate = played ? Math.round((wins / played) * 100) : 0;
    const gd = gf - ga;
    return { played, wins, draws, losses, gf, ga, gd, winRate };
  }, [rows]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">RVR U12 Scorekeeper</h1>
        <Link
          href="/add"
          className="rounded-lg px-3 py-2 text-white"
          style={{ background: '#ff6b00' }}
        >
          Record Match
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
        <Bubble label="Played" value={stats.played} />
        <Bubble label="W-D-L" value={`${stats.wins}-${stats.draws}-${stats.losses}`} />
        <Bubble label="GF/GA" value={`${stats.gf}/${stats.ga}`} />
        <Bubble label="GD" value={stats.gd} />
        <Bubble label="Win %" value={`${stats.winRate}`} />
      </div>

      {loading ? (
        <div className="mt-4 text-sm text-slate-500">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="mt-4 text-sm text-slate-500">No matches yet.</div>
      ) : (
        <div className="mt-4 space-y-2">
          {rows.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="text-sm">
                <div className="font-medium">
                  {formatDate(m.date)} · {m.home_away}
                </div>
                <div className="text-slate-600">
                  vs {m.opponent?.name ?? '—'} @ {m.venue?.name ?? '—'}
                </div>
              </div>
              <div className="text-lg font-bold">
                {(m.our_score ?? 0)}–{(m.their_score ?? 0)}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function Bubble({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-full px-3 py-2 border bg-white/80"
      style={{ borderColor: '#eef2f7' }}
    >
      <span className="font-semibold" style={{ color: '#0d6b3f' }}>{value}</span>
      <span className="text-slate-500 ml-1">{label}</span>
    </div>
  );
}
