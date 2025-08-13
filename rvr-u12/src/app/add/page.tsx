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

function outcome(us: number, them: number): 'W' | 'D' | 'L' {
  if (us > them) return 'W';
  if (us === them) return 'D';
  return 'L';
}

export default function Home() {
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id, date, our_score, their_score, home_away, is_friendly,
          league:leagues(name),
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

  const leagueForm = useMemo(() => {
    const leagueOnly = rows.filter(r => !r.is_friendly);
    const sortedAsc = [...leagueOnly].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const last5 = sortedAsc.slice(-5);
    return last5.map(m => outcome(m.our_score ?? 0, m.their_score ?? 0));
  }, [rows]);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">RVR U12 Scorekeeper</h1>
        
        <Link
  href="/record-match"
  prefetch={false}
  className="inline-block rounded-xl bg-orange-500 px-5 py-3 text-white font-semibold hover:opacity-90"
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

      {leagueForm.length > 0 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-slate-500">League form</span>
          <div className="flex items-center gap-1.5">
            {leagueForm.map((r, i) => <FormDot key={i} r={r} />)}
          </div>
        </div>
      )}

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
                {!m.is_friendly && m.league?.name ? (
                  <div className="text-xs text-slate-500 mt-0.5">{m.league.name}</div>
                ) : (
                  <div className="text-xs text-slate-500 mt-0.5">Friendly</div>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  {(m.our_score ?? 0)}–{(m.their_score ?? 0)}
                </div>
                <div className="mt-1 flex justify-end">
                  <Dot r={outcome(m.our_score ?? 0, m.their_score ?? 0)} />
                </div>
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

function FormDot({ r }: { r: 'W' | 'D' | 'L' }) {
  const bg = r === 'W' ? '#16a34a' : r === 'D' ? '#f59e0b' : '#ef4444';
  return (
    <div title={r} className="h-6 w-6 rounded-full text-[11px] text-white flex items-center justify-center" style={{ background: bg }}>
      {r}
    </div>
  );
}

function Dot({ r }: { r: 'W' | 'D' | 'L' }) {
  const bg = r === 'W' ? '#16a34a' : r === 'D' ? '#f59e0b' : '#ef4444';
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: bg }} />;
}
