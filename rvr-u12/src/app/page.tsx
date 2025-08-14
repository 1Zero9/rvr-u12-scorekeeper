"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
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
        .select("id, date, home_away, our_score, their_score, opponents(name)")
        .order("date", { ascending: false })
        .limit(5);

      if (error) {
        console.error(error);
      } else {
        setMatches(data || []);
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">RVR U12 Scorekeeper</h1>

      {/* Stats Bar */}
      <div className="flex gap-4 mb-4">
        <div className="px-4 py-2 border rounded-full">
          <span className="text-green-600 font-bold">1</span> Played
        </div>
        <div className="px-4 py-2 border rounded-full">
          <span className="text-green-600 font-bold">1-0-0</span> W-D-L
        </div>
        <div className="px-4 py-2 border rounded-full">
          <span className="text-green-600 font-bold">2/1</span> GF/GA
        </div>
        <div className="px-4 py-2 border rounded-full">
          <span className="text-green-600 font-bold">1</span> GD
        </div>
        <div className="px-4 py-2 border rounded-full">
          <span className="text-green-600 font-bold">100</span> Win %
        </div>
      </div>

      {/* Recent Matches */}
      <h2 className="text-lg font-semibold mb-2">Recent Matches</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div
              key={match.id}
              className="border rounded-lg p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-medium">
                  {new Date(match.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {match.home_away}
                </p>
                <p className="text-sm text-blue-600">
                  vs {match.opponents?.name || "Unknown"}
                </p>
              </div>
              <p className="text-lg font-bold">
                {match.our_score}–{match.their_score}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
