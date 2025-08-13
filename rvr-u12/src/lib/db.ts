import { supabase } from "./supabaseClient";

export async function upsertOpponentByName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Try find existing
  const { data: existing, error: findErr } = await supabase
    .from("opponents")
    .select("id, name")
    .ilike("name", trimmed)
    .limit(1)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing.id;

  // Insert new
  const { data: created, error: insErr } = await supabase
    .from("opponents")
    .insert({ name: trimmed })
    .select("id")
    .single();

  if (insErr) throw insErr;
  return created.id as string;
}

export type CreateMatchInput = {
  date: string;                 // "YYYY-MM-DD"
  opponentName: string;         // free text, will upsert opponents
  homeAway?: "home" | "away";   // optional for now
  notes?: string;
};

export async function createMatch({ date, opponentName, homeAway, notes }: CreateMatchInput) {
  const team_id = process.env.NEXT_PUBLIC_OUR_TEAM_ID!;
  const opponent_id = await upsertOpponentByName(opponentName);

  const payload = {
    team_id,
    date,             // date column is type 'date'
    opponent_id,
    home_away: homeAway ?? "home",
    is_friendly: true,
    team_size: 11,
    our_score: 0,
    their_score: 0,
    notes: notes ?? null,
    league_id: null,
    venue_id: null,
  };

  const { data, error } = await supabase
    .from("matches")
    .insert(payload)
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}
