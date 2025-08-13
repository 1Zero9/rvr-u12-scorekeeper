import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "RVR U12 Scorekeeper",
  description: "Record and review U12 match stats",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="font-semibold">
              RVR U12
            </Link>
            <div className="flex gap-3">
              <Link href="/" className="rounded-md px-3 py-1.5 text-sm hover:bg-gray-50">
                Home
              </Link>
              <Link
                href="/record-match"
                className="rounded-md bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Record Match
              </Link>
            </div>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
