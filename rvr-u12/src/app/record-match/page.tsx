"use client";

import React, { useEffect, useState } from "react";
import GoalsAssistsPanel from "../../components/GoalsAssistsPanel";
import { GoalEvent, Player } from "../../types/match";
import { supabase } from "../../lib/supabaseClient";
import { createMatch, insertGoals, updateMatchScore } from "../../lib/db";

const OUR_TEAM_ID = process.env.NEXT_PUBLIC_OUR_TEAM_ID!;

export default function Page() {
  // Players (loaded from Supabase)
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // Form state
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [homeAway, setHomeAway] = useState<"home" | "away">("home");
  const [goals, setGoals] = useState<GoalEvent[]>([]);
  const [saving, setSaving] = useState(false);

  // 1) Load our team’s players from Supabase
  useEffect(() => {
    (async () => {
      setLoadingPlayers(true);
      const { data, error } = await supabase
        .from("players")
        .select("id,name,shirt,team_id")
        .eq("team_id", OUR_TEAM_ID)
        .order("shirt", { ascending: true });

      if (error) {
        console.error("Load players error:", error);
        setPlayers([]);
      } else {
        const mapped: Player[] =
          (data ?? []).map((p: any) => ({
            id: p.id,
            name: p.name,
            teamId: p.team_id,
            shirtNumber: p.shirt ?? undefined,
          })) ?? [];
        setPlayers(mapped);
      }
      setLoadingPlayers(false);
    })();
  }, []);

  // 2) Submit: create match, insert goals, update score
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) return alert("Please choose a date.");
    if (!opponent.trim()) return alert("Please enter an opponent name.");
    if (goals.some((g) => !g.scorerId)) return alert("Each goal needs a scorer.");

    try {
      setSaving(true);

      // 2a) Create the match (opponent upsert happens inside createMatch)
      const matchId = await createMatch({
        date,
        opponentName: opponent.trim(),
        homeAway,
      });

      // Map playerId -> teamId for tallying
      const teamByPlayer = new Map(players.map((p) => [p.id, p.teamId]));

      // 2b) Compute scores and transform goal events
      let our = 0;
      let theirs = 0;

      const goalRows = goals.map((g) => {
        const scorerTeam = teamByPlayer.get(g.scorerId);
        const isOurPlayer = scorerTeam === OUR_TEAM_ID;

        // Who gets credited on the scoreboard?
        const creditedToUs = g.ownGoal ? !isOurPlayer : isOurPlayer;
        if (creditedToUs) our += 1;
        else theirs += 1;

        return {
          minute: g.minute,
          scorer_id: g.scorerId,
          assist_id: g.assistId ?? null,
          own_goal: g.ownGoal,
        };
      });

      // 2c) Save goals then update match score
      if (goalRows.length > 0) {
        await insertGoals(matchId, goalRows);
      }
      await updateMatchScore(matchId, our, theirs);

      // Done
      alert("Match saved!");
      // Optional reset
      setDate("");
      setOpponent("");
      setHomeAway("home");
      setGoals([]);
    } catch (err: any) {
      console.error("Save match failed:", err);
      alert(err?.message ?? "Failed to save match.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-4xl space-y-6 px-4">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-semibold">Record Match</h1>
          <p className="text-sm text-gray-500">
            Add match info, then goals & assists. Own goals credit the opposite side.
          </p>
        </div>

        {/* Match Info */}
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold">Match Info</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Date</label>
              <input
                type="date"
                className="w-full rounded-md border px-3 py-2"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium">Opponent</label>
              <input
                type="text"
                className="w-full rounded-md border px-3 py-2"
                placeholder="e.g. Swords Celtic"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Home / Away</label>
              <select
                className="w-full rounded-md border px-3 py-2"
                value={homeAway}
                onChange={(e) => setHomeAway(e.target.value as "home" | "away")}
              >
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            </div>
          </div>
        </section>

        {/* Goals & Assists */}
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold">Goals &amp; Assists</h2>
          {loadingPlayers ? (
            <p className="text-sm text-gray-500">Loading players…</p>
          ) : (
            <GoalsAssistsPanel
              homeTeamId={OUR_TEAM_ID}
              // We don't have opponent players loaded yet; this ID is unused in saving.
              awayTeamId="opponent-team"
              allPlayers={players}
              value={goals}
              onChange={setGoals}
            />
          )}
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl border bg-black px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Match"}
          </button>
        </div>
      </form>
    </main>
  );
}
