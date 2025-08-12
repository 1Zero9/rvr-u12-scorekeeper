cat > rvr-u12/src/app/page.tsx << 'EOF'
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Match = {
  id: string | number;
  date: string;
  opponent?: string | null;
  score_home?: number | null;
  score_away?: number | null;
  type?: string | null;
  notes?: string | null;
};

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: false });
      if (!error && data) setMatches(data as Match[]);
    };
    load();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold">RVR U12 Scorekeeper</h1>
      <div className="mt-4 text-sm">{matches.length} matches in DB</div>
    </main>
  );
}
EOF

cd rvr-u12
git add src/app/page.tsx
git commit -m "fix: remove any from page.tsx and type matches"
git push
