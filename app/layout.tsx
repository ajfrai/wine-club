import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wine Club - AI-Enriched Community Wine Sharing",
  description: "Building real-world community through taste-making and event orchestration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
