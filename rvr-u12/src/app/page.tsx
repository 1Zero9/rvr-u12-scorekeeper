"use client";

import Image from "next/image";
import Link from "next/link";



export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-blue-gradient text-white px-4 text-center">
      <Image
          src="/RVR.png"  // This is from /public
          alt="RVR Logo"
          width={160}
          height={160}
          priority
        />
      <h1 className="font-heading text-4xl font-bold">River Valley Rangers</h1>
      <p className="mt-2 font-body text-lg">Founded 1981</p>

      <div className="mt-8 space-x-4">
        <Link
          href="/record-match"
          className="bg-white text-primary font-heading px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
        >
          Record Match
        </Link>
        <Link
          href="/matches"
          className="bg-accent text-white font-heading px-6 py-3 rounded-lg shadow hover:opacity-90 transition"
        >
          View Matches
        </Link>
      </div>

      <p className="mt-10 text-sm font-body">
        <a href="https://www.rvrfc.ie" className="underline">
          www.rvrfc.ie
        </a>
      </p>
    </main>
  );
}
