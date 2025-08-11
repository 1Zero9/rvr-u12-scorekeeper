'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [matches, setMatches] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('matches').select('*').order('date', { ascending: false })
      .then(({ data, error }) => { if (!error) setMatches(data ?? []); });
  }, []);
  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">RVR U12 Scorekeeper</h1>
      <div className="mt-4 text-sm">{matches.length} matches in DB</div>
    </main>
  );
}
