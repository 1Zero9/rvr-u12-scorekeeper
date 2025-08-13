export type TeamSide = "home" | "away";

export interface Player {
  id: string;
  name: string;
  teamId: string;
  shirtNumber?: number;
}

export interface GoalEvent {
  id: string;       // uuid
  minute: number;   // 0–130
  teamSide: TeamSide;
  scorerId: string;
  assistId?: string;
  ownGoal: boolean;
}
