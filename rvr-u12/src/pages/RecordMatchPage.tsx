// src/pages/RecordMatchPage.tsx
import React, { useMemo, useState } from "react";
import GoalsAssistsPanel from "@/components/GoalsAssistsPanel";
import { GoalEvent, Player } from "@/types/match";
import { Card, CardContent } from "@/components/ui/card";

export default function RecordMatchPage() {
  // TODO: Replace these with your real IDs/state (e.g., selected match’s teams)
  const homeTeamId = "team_home_id";
  const awayTeamId = "team_away_id";

  // TODO: Replace with your player store/selector/fetch
  const allPlayers: Player[] = useMemo(
    () => [
      { id: "p1", name: "Alice Byrne", teamId: homeTeamId, shirtNumber: 9 },
      { id: "p2", name: "Ciara Doyle", teamId: homeTeamId, shirtNumber: 7 },
      { id: "p3", name: "Megan Fox", teamId: awayTeamId, shirtNumber: 10 },
      { id: "p4", name: "Katie Nolan", teamId: awayTeamId, shirtNumber: 8 },
    ],
    [homeTeamId, awayTeamId]
  );

  const [goals, setGoals] = useState<GoalEvent[]>([]);

  // Example: when saving the match, include `goals`
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate as you like (e.g., scorerId required)
    // Then POST/PUT this payload
    const payload = {
      // ...other match fields,
      goals, // <-- from panel
    };
    console.log("SUBMIT MATCH PAYLOAD", payload);
    // await api.saveMatch(payload)
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-4 space-y-4">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Record Match</h2>
          {/* Your match details inputs (teams, date, score, etc.) go here */}
        </CardContent>
      </Card>

      <GoalsAssistsPanel
        homeTeamId={homeTeamId}
        awayTeamId={awayTeamId}
        allPlayers={allPlayers}
        value={goals}
        onChange={setGoals}
      />

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium"
        >
          Save Match
        </button>
      </div>
    </form>
  );
}
