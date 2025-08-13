// src/lib/mockData.ts
import { Player } from "../types/match";

export const HOME_TEAM_ID = "team_home_id";
export const AWAY_TEAM_ID = "team_away_id";

// Replace with your real players later
export const mockPlayers: Player[] = [
  { id: "h1", name: "Alice Byrne",  teamId: HOME_TEAM_ID, shirtNumber: 9 },
  { id: "h2", name: "Ciara Doyle",  teamId: HOME_TEAM_ID, shirtNumber: 7 },
  { id: "h3", name: "Emily Ward",   teamId: HOME_TEAM_ID, shirtNumber: 3 },
  { id: "a1", name: "Megan Fox",    teamId: AWAY_TEAM_ID, shirtNumber: 10 },
  { id: "a2", name: "Katie Nolan",  teamId: AWAY_TEAM_ID, shirtNumber: 8 },
  { id: "a3", name: "Sarah Keane",  teamId: AWAY_TEAM_ID, shirtNumber: 4 },
];
