import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BioVerse 3D — Interactive NCERT Biology",
  description:
    "The NCERT Class 11 and 12 Biology syllabus as interactive 3D models, animations and diagrams. Built for Vidya Mandir Independent PU College.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
