// src/components/GoalsAssistsPanel.tsx
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { GoalEvent, Player, TeamSide } from "@/types/match";

type Props = {
  homeTeamId: string;
  awayTeamId: string;
  allPlayers: Player[];          // full pool, we’ll filter by team per row
  value: GoalEvent[];            // controlled value from parent
  onChange: (events: GoalEvent[]) => void;
};

function uid() {
  // Browser-safe UUID without extra deps
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
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
    const map = new Map<string, Player[]>();
    for (const p of allPlayers) {
      if (!map.has(p.teamId)) map.set(p.teamId, []);
      map.get(p.teamId)!.push(p);
    }
    return map;
  }, [allPlayers]);

  const playersForSide = (side: TeamSide) =>
    (side === "home" ? byTeamId.get(homeTeamId) : byTeamId.get(awayTeamId)) ?? [];

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
    next[idx] = { ...next[idx], ...patch };
    // Clear scorer/assist if teamSide changed to avoid cross-team IDs lingering
    if (patch.teamSide) {
      next[idx].scorerId = "";
      next[idx].assistId = undefined;
    }
    // Clear assist when ownGoal = true
    if (typeof patch.ownGoal === "boolean" && patch.ownGoal) {
      next[idx].assistId = undefined;
    }
    onChange(next);
  };

  const removeAt = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const renderPlayerLabel = (p: Player) =>
    p.shirtNumber ? `${p.shirtNumber} · ${p.name}` : p.name;

  return (
    <Card className="mt-4">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Goals & Assists</h3>
          <Button onClick={addGoal} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Add Goal
          </Button>
        </div>

        {(value?.length ?? 0) === 0 ? (
          <p className="text-sm text-muted-foreground">
            No goals yet. Click <span className="font-medium">Add Goal</span> to start.
          </p>
        ) : null}

        <div className="space-y-4">
          {value.map((ev, idx) => {
            const teamPlayers = playersForSide(ev.teamSide);
            const assistDisabled = ev.ownGoal;

            return (
              <div
                key={ev.id}
                className="grid grid-cols-12 gap-3 items-end rounded-xl border p-3"
              >
                {/* Team */}
                <div className="col-span-12 sm:col-span-2">
                  <Label className="mb-1 block">Team</Label>
                  <Select
                    value={ev.teamSide}
                    onValueChange={(v) => updateAt(idx, { teamSide: v as TeamSide })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="away">Away</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Minute */}
                <div className="col-span-6 sm:col-span-2">
                  <Label className="mb-1 block">Minute</Label>
                  <Input
                    type="number"
                    min={0}
                    max={130}
                    value={Number.isFinite(ev.minute) ? ev.minute : 0}
                    onChange={(e) =>
                      updateAt(idx, { minute: Math.max(0, Math.min(130, Number(e.target.value))) })
                    }
                    placeholder="e.g. 23"
                  />
                </div>

                {/* Scorer */}
                <div className="col-span-12 sm:col-span-3">
                  <Label className="mb-1 block">
                    {ev.ownGoal ? "Scorer (opponent)" : "Scorer"}
                  </Label>
                  <Select
                    value={ev.scorerId}
                    onValueChange={(v) => updateAt(idx, { scorerId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {teamPlayers.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {renderPlayerLabel(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Assist */}
                <div className="col-span-12 sm:col-span-3 opacity-100">
                  <div className={assistDisabled ? "opacity-50" : ""}>
                    <Label className="mb-1 block">Assist (optional)</Label>
                    <Select
                      value={ev.assistId ?? ""}
                      onValueChange={(v) =>
                        updateAt(idx, { assistId: v === "" ? undefined : v })
                      }
                      disabled={assistDisabled}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={assistDisabled ? "Disabled for OG" : "Select player"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">— None —</SelectItem>
                        {teamPlayers
                          .filter((p) => p.id !== ev.scorerId) // avoid self-assist
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {renderPlayerLabel(p)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Own Goal */}
                <div className="col-span-6 sm:col-span-1 flex flex-col">
                  <Label className="mb-1 block">Own Goal</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ev.ownGoal}
                      onCheckedChange={(checked) => updateAt(idx, { ownGoal: checked })}
                    />
                    {ev.ownGoal ? (
                      <span className="text-xs text-red-600 font-semibold">OG</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                {/* Remove */}
                <div className="col-span-6 sm:col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => removeAt(idx)} aria-label="Remove goal">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compact readout */}
        {value.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-1">Summary</p>
            <ul className="text-sm space-y-1">
              {value
                .slice()
                .sort((a, b) => a.minute - b.minute)
                .map((ev) => {
                  const sideLabel = ev.teamSide === "home" ? "Home" : "Away";
                  const teamPlayers = playersForSide(ev.teamSide);
                  const scorer = teamPlayers.find((p) => p.id === ev.scorerId)?.name ?? "—";
                  const assist =
                    ev.assistId ? teamPlayers.find((p) => p.id === ev.assistId)?.name : undefined;
                  return (
                    <li key={`summary-${ev.id}`} className={ev.ownGoal ? "text-red-600" : ""}>
                      {sideLabel} {ev.minute}′ — {scorer}
                      {ev.ownGoal ? " (OG)" : assist ? ` (assist: ${assist})` : ""}
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}