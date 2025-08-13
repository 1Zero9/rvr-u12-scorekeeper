"use client";

import React, { useMemo, useState } from "react";
import GoalsAssistsPanel from "../../components/GoalsAssistsPanel";
import { GoalEvent, Player } from "../../types/match";
import { HOME_TEAM_ID, AWAY_TEAM_ID, mockPlayers } from "../../lib/mockData";

export default function Page() {
  const homeTeamId = HOME_TEAM_ID;
  const awayTeamId = AWAY_TEAM_ID;

  const allPlayers: Player[] = useMemo(() => mockPlayers, []);
  const [goals, setGoals] = useState<GoalEvent[]>([]);
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goals.some((g) => !g.scorerId)) {
      alert("Please select a scorer for each goal.");
      return;
    }
    const payload = { date, opponent, goals };
    console.log("SUBMIT MATCH PAYLOAD", payload);
    alert("Match saved (see console).");
  };

  return (
    <form onSubmit={onSubmit} className="max-w-4xl mx-auto p-4 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Record Match</h1>
        <p className="text-sm text-gray-500">
          Add goals & assists. Own goals pull the scorer from the opposite team.
        </p>
      </header>

      {/* Simple match meta */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border rounded-xl p-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            className="w-full border rounded-md px-2 py-1.5"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Opponent</label>
          <input
            type="text"
            className="w-full border rounded-md px-2 py-1.5"
            placeholder="e.g. St. Mary’s U12"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
          />
        </div>
      </div>

      <GoalsAssistsPanel
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        allPlayers={allPlayers}
        value={goals}
        onChange={setGoals}
      />

      <div className="flex justify-end">
        <button type="submit" className="border px-4 py-2 rounded-md text-sm hover:bg-gray-50">
          Save Match
        </button>
      </div>
    </form>
  );
}
