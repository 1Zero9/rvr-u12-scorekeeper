"use client";

import React, { useMemo, useState } from "react";
import GoalsAssistsPanel from "../../components/GoalsAssistsPanel";
import { GoalEvent, Player } from "../../types/match";
import { HOME_TEAM_ID, AWAY_TEAM_ID, mockPlayers } from "../../lib/mockData";
import { createMatch } from "../../lib/db";

export default function Page() {
  const homeTeamId = HOME_TEAM_ID;
  const awayTeamId = AWAY_TEAM_ID;

  const allPlayers: Player[] = useMemo(() => mockPlayers, []);
  const [goals, setGoals] = useState<GoalEvent[]>([]);
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [homeAway, setHomeAway] = useState<"home" | "away">("home");
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) return alert("Please choose a date.");
    if (!opponent.trim()) return alert("Please enter an opponent name.");

    try {
      setSaving(true);
      // Step 1: create the match only (we'll add goals next)
      const matchId = await createMatch({
        date,
        opponentName: opponent,
        homeAway,
      });

      console.log("Created match:", matchId);
      alert("Match saved!");
      // Optionally reset form
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
            Add match info, then goals and assists. (Goals save coming next.)
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
                placeholder="e.g. St. Mary’s U12"
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

        {/* Goals & Assists (UI only for now) */}
        <section className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold">Goals &amp; Assists</h2>
          <GoalsAssistsPanel
            homeTeamId={homeTeamId}
            awayTeamId={awayTeamId}
            allPlayers={allPlayers}
            value={goals}
            onChange={setGoals}
          />
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
