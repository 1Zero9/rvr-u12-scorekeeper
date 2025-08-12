// src/types/match.ts
export type TeamSide = "home" | "away";

export interface Player {
  id: string;
  name: string;
  teamId: string;
  shirtNumber?: number;
}

export interface GoalEvent {
  id: string;
  minute: number;
  teamSide: TeamSide;
  scorerId: string;
  assistId?: string;
  ownGoal: boolean;
}
