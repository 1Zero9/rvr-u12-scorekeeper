"use client";

import React, { useEffect, useMemo, useState } from "react";
import GoalsAssistsPanel from "../../components/GoalsAssistsPanel";
import { GoalEvent, Player } from "../../types/match";
import { createMatch } from "../../lib/db";
import { supabase } from "../../lib/supabaseClient";

const OUR_TEAM_ID = process.env.NEXT_PUBLIC_OUR_TEAM_ID!;

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  // form state
  const [goals, setGoals] = useState<GoalEvent[]>([]);
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [homeAway, setHomeAway] = useState<"home" | "away">("home");
  const [saving, setSaving] = useState(false);

  // fetch players from Supabase (our team only)
  useEffect(() => {
    (async () => {
      setLoadingPlayers(true);
      const { data, error } = await supabase
        .from("players")
        .select("id,name,shirt,team_id")
        .eq("team_id", OUR_TEAM_ID)
        .order("shirt", { ascending: true });
      if (error) {
        console.error(error);
        setPlayers([]);
      } else {
        const mapped: Player[] = (data ?? []).map((p: any) => ({
          id: p.id,
          name: p.name,
          teamId: p.team_id,
          shirtNumber: p.shirt ?? undefined,
        }));
        setPlayers(mapped);
      }
      setLoadingPlayers(false);
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return alert("Please choose a date.");
    if (!opponent.trim()) return alert("Please enter an opponent name.");

    try {
      setSaving(true);
      // Step 1: create match row only (we’ll add goals/scores next step)
      const matchId = await createMatch({
        date,
        opponentName: opponent,
        homeAway,
      });

      console.log("Created match:", matchId);
      alert("Match saved!");
      setGoals([]);
      setOpponent("");
      setDate("");
    } catch (err: any) {
      console.error(err);
      alert(err?.message ?? "Failed to save match.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-4xl space-y-6 px-4">
        <div>
          <h1 className="text-2xl font-semibold">Record Match</h1>
          <p className="text-sm text-gray-500">
            Add match info, then goals and assists.
          </p>
        </div>

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

        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold">Goals &amp; Assists</h2>
          {loadingPlayers ? (
            <p className="text-sm text-gray-500">Loading players…</p>
          ) : (
            <GoalsAssistsPanel
              homeTeamId={OUR_TEAM_ID}
              awayTeamId={"opponent-team"} // placeholder; scorer team inferred by player.teamId
              allPlayers={players}
              value={goals}
              onChange={setGoals}
            />
          )}
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl border bg-black px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Match"}
          </button>
        </div>
      </form>
    </main>
  );
}
