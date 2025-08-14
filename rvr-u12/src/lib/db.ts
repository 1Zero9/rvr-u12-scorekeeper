// src/lib/db.ts
import { supabase } from "./supabaseClient";

/**
 * Upsert opponent by name (case-insensitive) AND ensure they have a matching teams record.
 * Returns the TEAM UUID so it can be used for loading players.
 */
export async function upsertOpponentByName(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;

  // 1️⃣ Find or insert opponent
  const { data: existingOpponent, error: findOpponentError } = await supabase
    .from("opponents")
    .select("id, name")
    .ilike("name", trimmed)
    .limit(1)
    .maybeSingle();

  if (findOpponentError) {
    console.error("Error finding opponent:", findOpponentError);
    throw new Error("Failed to check opponent");
  }

  if (!existingOpponent) {
    const { error: insertOpponentError } = await supabase
      .from("opponents")
      .insert([{ name: trimmed }]);
    if (insertOpponentError) {
      console.error("Error inserting opponent:", insertOpponentError);
      throw new Error("Failed to add opponent");
    }
  }

  // 2️⃣ Find or insert matching team
  const { data: existingTeam, error: findTeamError } = await supabase
    .from("teams")
    .select("id")
    .eq("name", trimmed)
    .limit(1)
    .maybeSingle();

  if (findTeamError) {
    console.error("Error finding team:", findTeamError);
    throw new Error("Failed to check team");
  }

  let teamId: string;
  if (existingTeam) {
    teamId = existingTeam.id;
  } else {
    const { data: newTeam, error: insertTeamError } = await supabase
      .from("teams")
      .insert([{ name: trimmed }])
      .select("id")
      .single();
    if (insertTeamError) {
      console.error("Error creating team:", insertTeamError);
      throw new Error("Failed to create team");
    }
    teamId = newTeam.id;
  }

  // ✅ Return teamId — this is what we use to load opponent players
  return teamId;
}

export type CreateMatchInput = {
  date: string;                 // YYYY-MM-DD
  opponentName: string;         // free text; will be upserted into opponents & teams
  homeAway?: "home" | "away";   // defaults to "home"
  notes?: string | null;
};

/** Create a match row and return its id */
export async function createMatch(input: CreateMatchInput): Promise<string> {
  const team_id = process.env.NEXT_PUBLIC_OUR_TEAM_ID;
  if (!team_id) throw new Error("Missing NEXT_PUBLIC_OUR_TEAM_ID");

  const opponent_team_id = await upsertOpponentByName(input.opponentName);

  const payload = {
    team_id,
    date: input.date,
    opponent_id: null, // optional: keep null if not directly linking to opponents table
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
    .insert([payload])
    .select("id")
    .single();

  if (error) {
    console.error("Error creating match:", error);
    throw new Error("Failed to create match");
  }
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
  if (error) {
    console.error("Error inserting goals:", error);
    throw new Error("Failed to insert goals");
  }
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
  if (error) {
    console.error("Error updating match score:", error);
    throw new Error("Failed to update match score");
  }
}
