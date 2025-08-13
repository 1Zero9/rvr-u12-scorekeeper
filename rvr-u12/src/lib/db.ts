// src/lib/db.ts
import { supabase } from "./supabaseClient";

/** Upsert opponent by name (case-insensitive); returns the opponent UUID */
export async function upsertOpponentByName(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // Try find existing (ILIKE = case-insensitive)
  const { data: existing, error: findErr } = await supabase
    .from("opponents")
    .select("id, name")
    .ilike("name", trimmed)
    .limit(1)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing.id as string;

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
  date: string;                 // YYYY-MM-DD
  opponentName: string;         // free text; will be upserted into opponents
  homeAway?: "home" | "away";   // defaults to "home"
  notes?: string | null;
};

/** Create a match row and return its id */
export async function createMatch(input: CreateMatchInput): Promise<string> {
  const team_id = process.env.NEXT_PUBLIC_OUR_TEAM_ID;
  if (!team_id) throw new Error("Missing NEXT_PUBLIC_OUR_TEAM_ID");

  const opponent_id = await upsertOpponentByName(input.opponentName);

  const payload = {
    team_id,
    date: input.date,
    opponent_id,
    home_away: input.homeAway ?? "home",
    is_friendly: true,
    team_size: 11,
    our_score: 0,
    their_score: 0,
    notes: input.notes ?? null,
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

/** Bulk insert goals for a match */
export async function insertGoals(
  matchId: string,
  events: {
    minute: number;
    scorer_id: string;
    assist_id?: string | null;
    own_goal: boolean;
  }[]
): Promise<void> {
  if (!events || events.length === 0) return;

  const rows = events.map((e) => ({
    match_id: matchId,
    minute: e.minute,
    scorer_id: e.scorer_id,
    assist_id: e.assist_id ?? null,
    own_goal: e.own_goal,
  }));

  const { error } = await supabase.from("goals").insert(rows);
  if (error) throw error;
}

/** Update match score totals */
export async function updateMatchScore(
  matchId: string,
  our: number,
  theirs: number
): Promise<void> {
  const { error } = await supabase
    .from("matches")
    .update({ our_score: our, their_score: theirs })
    .eq("id", matchId);
  if (error) throw error;
}
