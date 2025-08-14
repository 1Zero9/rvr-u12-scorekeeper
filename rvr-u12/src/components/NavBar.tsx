"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();
  const is = (p: string) => pathname === p;

  return (
    <header className="border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold">RVR U12</Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={`rounded-md px-3 py-2 text-sm ${is("/") ? "bg-gray-900 text-white" : "hover:bg-gray-100"}`}
          >
            Home
          </Link>
          <Link
            href="/record-match"
            className={`rounded-md px-3 py-2 text-sm ${is("/record-match") ? "bg-orange-500 text-white" : "bg-orange-500/90 text-white hover:opacity-90"}`}
          >
            Record Match
          </Link>
        </nav>
      </div>
    </header>
  );
}
