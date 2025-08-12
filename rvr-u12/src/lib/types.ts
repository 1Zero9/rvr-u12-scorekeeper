export type HomeAway = 'Home' | 'Away';

export type MatchRow = {
  id: string | number;
  date: string;
  our_score: number | null;
  their_score: number | null;
  home_away: HomeAway;
  is_friendly: boolean | null;
  league: { name: string } | null;
  opponent: { name: string } | null;
  venue: { name: string } | null;
};