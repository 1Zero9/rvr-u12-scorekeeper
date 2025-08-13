"use client";

import React, { useMemo } from "react";
import { GoalEvent, Player, TeamSide } from "../types/match";

type Props = {
  homeTeamId: string;
  awayTeamId: string;
  allPlayers: Player[];
  value: GoalEvent[];
  onChange: (events: GoalEvent[]) => void;
};

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id_${Math.random().toString(36).slice(2, 10)}`;
}

export default function GoalsAssistsPanel({
  homeTeamId,
  awayTeamId,
  allPlayers,
  value,
  onChange,
}: Props) {
  const byTeamId = useMemo(() => {
    const m = new Map<string, Player[]>();
    for (const p of allPlayers) {
      if (!m.has(p.teamId)) m.set(p.teamId, []);
      m.get(p.teamId)!.push(p);
    }
    return m;
  }, [allPlayers]);

  const playersForSide = (side: TeamSide) =>
    (side === "home" ? byTeamId.get(homeTeamId) : byTeamId.get(awayTeamId)) ?? [];
  const opposite = (side: TeamSide): TeamSide => (side === "home" ? "away" : "home");
  const scorerPool = (ev: GoalEvent) =>
    ev.ownGoal ? playersForSide(opposite(ev.teamSide)) : playersForSide(ev.teamSide);
  const assistPool = (ev: GoalEvent) => playersForSide(ev.teamSide);

  const addGoal = () => {
    const next: GoalEvent = {
      id: uid(),
      minute: 0,
      teamSide: "home",
      scorerId: "",
      assistId: undefined,
      ownGoal: false,
    };
    onChange([...(value ?? []), next]);
  };

  const updateAt = (idx: number, patch: Partial<GoalEvent>) => {
    const next = [...value];
    const prev = next[idx];
    const updated: GoalEvent = { ...prev, ...patch };

    if (patch.teamSide) {
      updated.scorerId = "";
      updated.assistId = undefined;
    }
    if (typeof patch.ownGoal === "boolean") {
      if (patch.ownGoal) {
        updated.assistId = undefined;
        updated.scorerId = "";
      } else {
        updated.scorerId = "";
      }
    }

    next[idx] = updated;
    onChange(next);
  };

  const removeAt = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const label = (p: Player) => (p.shirtNumber ? `${p.shirtNumber} · ${p.name}` : p.name);

  return (
    <div className="mt-4 border rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Goals &amp; Assists</h3>
        <button type="button" onClick={addGoal} className="text-sm border px-3 py-1.5 rounded-md hover:bg-gray-50">
          + Add Goal
        </button>
      </div>

      {(!value || value.length === 0) && (
        <p className="text-sm text-gray-500">
          No goals yet. Click <span className="font-medium">Add Goal</span> to start.
        </p>
      )}

      <div className="space-y-4">
        {value.map((ev, idx) => {
          const scorerList = scorerPool(ev);
          const assistList = assistPool(ev);
          const assistDisabled = ev.ownGoal;

          return (
            <div key={ev.id} className="grid grid-cols-12 gap-3 items-end border rounded-lg p-3">
              <div className="col-span-12 sm:col-span-2">
                <label className="block text-sm font-medium mb-1">Team</label>
                <select
                  className="w-full border rounded-md px-2 py-1.5"
                  value={ev.teamSide}
                  onChange={(e) => updateAt(idx, { teamSide: e.target.value as TeamSide })}
                >
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>