import { supabase } from "./supabaseClient";

export async function insertGoals(matchId: string, events: {
  minute: number;
  scorer_id: string;
  assist_id?: string | null;
  own_goal: boolean;
}[]) {
  if (events.length === 0) return;
  const { error } = await supabase.from("goals").insert(
    events.map((e) => ({
      match_id: matchId,
      minute: e.minute,
      scorer_id: e.scorer_id,
      assist_id: e.assist_id ?? null,
      own_goal: e.own_goal,
    }))
  );
  if (error) throw error;
}

export async function updateMatchScore(matchId: string, our: number, theirs: number) {
  const { error } = await supabase
    .from("matches")
    .update({ our_score: our, their_score: theirs })
    .eq("id", matchId);
  if (error) throw error;
}
