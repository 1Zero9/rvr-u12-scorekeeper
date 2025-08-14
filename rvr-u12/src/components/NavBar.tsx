"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";


export default function NavBar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-primaryDark">
      <Link href="/" className="flex items-center space-x-3">
        <Image
          src="/RVR.png"  // This is from /public
          alt="RVR Logo"
          width={80}
          height={80}
          priority
        />
        {isHome && (
          <span className="font-heading text-2xl">River Valley Rangers</span>
        )}
      </Link>

      <div className="flex space-x-4 font-body text-sm">
        <Link href="/record-match" className="hover:underline">Record Match</Link>
        <Link href="/matches" className="hover:underline">Matches</Link>
        <Link href="/players" className="hover:underline">Players</Link>
        <Link href="/opponents" className="hover:underline">Opponents</Link>
      </div>
    </nav>
  );
}
