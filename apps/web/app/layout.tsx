import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Steward",
  description: "Giving & treasury for parishes, schools, and small nonprofits.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
