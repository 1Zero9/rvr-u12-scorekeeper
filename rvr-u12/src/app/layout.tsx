import '../styles/globals.css';
import { Raleway, Open_Sans } from "next/font/google";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-heading" });
const openSans = Open_Sans({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "RVR Matchday",
  description: "River Valley Rangers match recording app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${raleway.variable} ${openSans.variable}`}>
      {/* ✅ Now using manual gradient class from globals.css */}
      <body className="font-body bg-blue-gradient text-white min-h-screen">
        {children}
      </body>
    </html>
  );
}
