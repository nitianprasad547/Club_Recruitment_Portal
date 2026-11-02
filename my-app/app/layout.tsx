import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CLUB — Build what’s next",
  description: "Join CLUB, a community of curious minds building useful things.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
