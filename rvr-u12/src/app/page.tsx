'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type MatchRow = {
  id: string | number;
  date: string;
  our_score: number | null;
  their_score: number | null;
  home_away: 'Home' | 'Away';
  opponent: { name: string } | null;
  venue: { name: string } | null;
};

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

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">RVR U12 Scorekeeper</h1>

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