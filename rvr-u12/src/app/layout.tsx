import "./globals.css";
import NavBar from "../components/navbar"
export const metadata = {
  title: "RVR U12 Scorekeeper",
  description: "Record and review U12 match stats",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">import "./globals.css";
import NavBar from "../components/NavBar";

export const metadata = {
  title: "RVR U12 Scorekeeper",
  description: "Record and review U12 match stats",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

      <body className="bg-gray-50">
        <NavBar />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
