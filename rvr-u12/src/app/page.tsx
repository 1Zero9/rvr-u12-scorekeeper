"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";

type MatchRow = {
  id: string;
  date: string;
  home_away: string;
  our_score: number;
  their_score: number;
  opponents: { name: string } | null;
};

export default function HomePage() {
  const [matches, setMatches] = useState<MatchRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          id,
          date,
          home_away,
          our_score,
          their_score,
          opponents ( name )
        `
        )
        .order("date", { ascending: false });

      if (error) {
        console.error(error);
      } else {
        // Convert opponents array → single object
        const transformed = (data || []).map((match) => ({
          ...match,
          opponents: match.opponents?.[0] || null,
        }));
        setMatches(transformed);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">RVR U12 Scorekeeper</h1>

      {/* Stats bar placeholder */}
      <div className="flex gap-4 mb-6">
        <div className="px-3 py-1 border rounded-full text-center">
          1 Played
        </div>
        <div className="px-3 py-1 border rounded-full text-center">
          1-0-0 W-D-L
        </div>
        <div className="px-3 py-1 border rounded-full text-center">
          2/1 GF/GA
        </div>
        <div className="px-3 py-1 border rounded-full text-center">1 GD</div>
        <div className="px-3 py-1 border rounded-full text-center">
          100 Win %
        </div>
      </div>

      {/* Matches list */}
      {loading ? (
        <p>Loading...</p>
      ) : matches.length === 0 ? (
        <p>No matches found.</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {match.date} · {match.home_away}
                </p>
                <p className="text-sm text-blue-600">
                  vs {match.opponents?.name || "Unknown"}
                </p>
              </div>
              <div className="text-lg font-bold">
                {match.our_score} – {match.their_score}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
