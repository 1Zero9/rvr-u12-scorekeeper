'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { HomeAway } from '@/lib/types';

type IdName = { id: string; name: string };

export default function AddMatch() {
  const router = useRouter();

  const [opponents, setOpponents] = useState<IdName[]>([]);
  const [leagues, setLeagues] = useState<IdName[]>([]);
  const [venues, setVenues] = useState<IdName[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [date, setDate] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [homeAway, setHomeAway] = useState<HomeAway>('Home');
  const [isFriendly, setIsFriendly] = useState<boolean>(false);
  const [teamSize, setTeamSize] = useState<9|11>(9);
  const [opponentId, setOpponentId] = useState<string>('');
  const [leagueId, setLeagueId] = useState<string>('');
  const [venueId, setVenueId] = useState<string>('');
  const [ourScore, setOurScore] = useState<number>(0);
  const [theirScore, setTheirScore] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      const [{ data: opps }, { data: leag }, { data: vens }] = await Promise.all([
        supabase.from('opponents').select('id,name').order('name', { ascending: true }),
        supabase.from('leagues').select('id,name').order('name', { ascending: true }),
        supabase.from('venues').select('id,name').order('name', { ascending: true }),
      ]);
      setOpponents((opps ?? []) as IdName[]);
      setLeagues((leag ?? []) as IdName[]);
      setVenues((vens ?? []) as IdName[]);
      setLoading(false);
    };
    load();
  }, []);

  const canSave = useMemo(() => {
    return !!date && !!homeAway && !!opponentId && (!!isFriendly || !!leagueId) && !!venueId;
  }, [date, homeAway, opponentId, isFriendly, leagueId, venueId]);

  async function onSave() {
    if (!canSave) return alert('Please fill date, home/away, opponent, venue, and league (for league matches).');
    setSaving(true);
    // If you use teams, pick the first team for now; adjust as needed later.
    const { data: team } = await supabase.from('teams').select('id').limit(1).maybeSingle();
    const teamId = team?.id ?? null;

    const { error } = await supabase.from('matches').insert([{
      team_id: teamId,
      date,
      opponent_id: opponentId,
      home_away: homeAway,
      venue_id: venueId,
      league_id: isFriendly ? null : leagueId,
      is_friendly: isFriendly,
      team_size: teamSize,
      our_score: ourScore,
      their_score: theirScore,
      notes,
    }]);

    setSaving(false);
    if (error) {
      alert(`Could not save: ${error.message}`);
      return;
    }
    router.push('/');
  }

  if (loading) {
    return <main className="p-6 max-w-xl mx-auto">Loading…</main>;
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Record Match</h1>

      <Field label="Date">
        <input
          type="date"
          className="w-full rounded border p-2"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </Field>

      <Field label="Home / Away">
        <div className="flex gap-2">
          <Toggle active={homeAway === 'Home'} onClick={() => setHomeAway('Home')}>Home</Toggle>
          <Toggle active={homeAway === 'Away'} onClick={() => setHomeAway('Away')}>Away</Toggle>
        </div>
      </Field>

      <Field label="Match Type">
        <div className="flex gap-2">
          <Toggle active={!isFriendly} onClick={() => setIsFriendly(false)}>League</Toggle>
          <Toggle active={isFriendly} onClick={() => setIsFriendly(true)}>Friendly</Toggle>
        </div>
      </Field>

      <Field label="Team Size">
        <div className="flex gap-2">
          <Toggle active={teamSize === 9} onClick={() => setTeamSize(9)}>9-a-side</Toggle>
          <Toggle active={teamSize === 11} onClick={() => setTeamSize(11)}>11-a-side</Toggle>
        </div>
      </Field>

      <Field label="Opponent">
        <select className="w-full rounded border p-2" value={opponentId} onChange={e => setOpponentId(e.target.value)}>
          <option value="">Select opponent…</option>
          {opponents.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
      </Field>

      {!isFriendly && (
        <Field label="League">
          <select className="w-full rounded border p-2" value={leagueId} onChange={e => setLeagueId(e.target.value)}>
            <option value="">Select league…</option>
            {leagues.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </Field>
      )}

      <Field label="Venue">
        <select className="w-full rounded border p-2" value={venueId} onChange={e => setVenueId(e.target.value)}>
          <option value="">Select venue…</option>
          {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Our Score">
          <Stepper value={ourScore} inc={() => setOurScore(v => v + 1)} dec={() => setOurScore(v => Math.max(0, v - 1))} />
        </Field>
        <Field label="Their Score">
          <Stepper value={theirScore} inc={() => setTheirScore(v => v + 1)} dec={() => setTheirScore(v => Math.max(0, v - 1))} />
        </Field>
      </div>

      <Field label="Notes">
        <textarea className="w-full rounded border p-2" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional…" />
      </Field>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onSave}
          disabled={!canSave || saving}
          className="rounded px-4 py-2 text-white disabled:opacity-60"
          style={{ background: '#0d6b3f' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => history.back()}
          className="rounded px-4 py-2 border"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-xs text-slate-600 mb-1">{label}</div>
      {children}
    </div>
  );
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="rounded px-3 py-2 border"
      style={{
        background: active ? '#ff6b00' : 'white',
        color: active ? 'white' : '#0b1f3b',
        borderColor: active ? '#ff6b00' : '#dce3ea'
      }}
    >
      {children}
    </button>
  );
}

function Stepper({ value, inc, dec }: { value: number; inc: () => void; dec: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button onClick={dec} className="h-10 w-10 rounded border">−</button>
      <div className="text-xl font-bold w-10 text-center">{value}</div>
      <button onClick={inc} className="h-10 w-10 rounded border">+</button>
    </div>
  );
}
