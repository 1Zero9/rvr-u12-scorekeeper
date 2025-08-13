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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Add each goal with minute, scorer and optional assist. Toggle OG for own goals.
        </p>
        <button
          type="button"
          onClick={addGoal}
          className="rounded-lg border bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
        >
          + Add Goal
        </button>
      </div>

      {(!value || value.length === 0) && (
        <p className="rounded-lg border border-dashed bg-gray-50 p-3 text-sm text-gray-500">
          No goals yet. Click <span className="font-medium">+ Add Goal</span> to start.
        </p>
      )}

      <div className="space-y-4">
        {value.map((ev, idx) => {
          const scorerList = scorerPool(ev);
          const assistList = assistPool(ev);
          const assistDisabled = ev.ownGoal;

          return (
            <div key={ev.id} className="grid grid-cols-12 items-end gap-3 rounded-xl border p-3">
              {/* Team credited */}
              <div className="col-span-12 sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Team</label>
                <select
                  className="w-full rounded-md border px-2 py-2"
                  value={ev.teamSide}
                  onChange={(e) => updateAt(idx, { teamSide: e.target.value as TeamSide })}
                >
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>
              </div>

              {/* Minute */}
              <div className="col-span-6 sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Minute</label>
                <input
                  type="number"
                  min={0}
                  max={130}
                  className="w-full rounded-md border px-2 py-2"
                  value={Number.isFinite(ev.minute) ? ev.minute : 0}
                  onChange={(e) =>
                    updateAt(idx, { minute: Math.max(0, Math.min(130, Number(e.target.value))) })
                  }
                  placeholder="e.g. 23"
                />
              </div>

              {/* Scorer */}
              <div className="col-span-12 sm:col-span-4">
                <label className="mb-1 block text-sm font-medium">
                  {ev.ownGoal ? "Scorer (defender who scored OG)" : "Scorer"}
                </label>
                <select
                  className="w-full rounded-md border px-2 py-2"
                  value={ev.scorerId}
                  onChange={(e) => updateAt(idx, { scorerId: e.target.value })}
                >
                  <option value="">Select player…</option>
                  {scorerList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {label(p)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Assist */}
              <div className={`col-span-12 sm:col-span-3 ${assistDisabled ? "opacity-50" : ""}`}>
                <label className="mb-1 block text-sm font-medium">Assist (optional)</label>
                <select
                  className="w-full rounded-md border px-2 py-2"
                  value={ev.assistId ?? ""}
                  onChange={(e) =>
                    updateAt(idx, { assistId: e.target.value === "" ? undefined : e.target.value })
                  }
                  disabled={assistDisabled}
                >
                  <option value="">— None —</option>
                  {assistList
                    .filter((p) => p.id !== ev.scorerId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {label(p)}
                      </option>
                    ))}
                </select>
              </div>

              {/* Own Goal */}
              <div className="col-span-6 sm:col-span-1">
                <label className="mb-1 block text-sm font-medium">Own Goal</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ev.ownGoal}
                    onChange={(e) => updateAt(idx, { ownGoal: e.target.checked })}
                  />
                  {ev.ownGoal ? (
                    <span className="text-xs font-semibold text-red-600">OG</span>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  )}
                </div>
              </div>

              {/* Remove */}
              <div className="col-span-6 sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  className="rounded-md border px-2 py-2 text-sm hover:bg-gray-50"
                  onClick={() => removeAt(idx)}
                >
                  Remove
                </button>
              </div>

              {/* Hint */}
              <div className="col-span-12 text-xs text-gray-500">
                {ev.ownGoal
                  ? "For OG: team shown is credited with the goal; select the defender from the opposite team."
                  : "Scorer and (optional) assist are from the team credited above."}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      {value.length > 0 && (
        <div className="border-t pt-3">
          <p className="mb-1 text-sm font-medium">Summary</p>
          <ul className="space-y-1 text-sm">
            {value
              .slice()
              .sort((a, b) => a.minute - b.minute)
              .map((ev) => {
                const sideLabel = ev.teamSide === "home" ? "Home" : "Away";
                const pool = scorerPool(ev);
                const scorer = pool.find((p) => p.id === ev.scorerId)?.name ?? "—";
                const assist = ev.assistId
                  ? assistPool(ev).find((p) => p.id === ev.assistId)?.name
                  : undefined;
                return (
                  <li key={`sum-${ev.id}`} className={ev.ownGoal ? "text-red-600" : ""}>
                    {sideLabel} {ev.minute}′ — {scorer}
                    {ev.ownGoal ? " (OG)" : assist ? ` (assist: ${assist})` : ""}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}
