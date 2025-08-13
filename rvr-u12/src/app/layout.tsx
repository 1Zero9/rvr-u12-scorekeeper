import "./globals.css";

export const metadata = {
  title: "RVR U12 Scorekeeper",
  description: "Record and review U12 match stats",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
