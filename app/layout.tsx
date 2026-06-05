import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Revia — Spatial memories, coming soon",
  description:
    "Revia lets you create, save, and revisit personal moments through object-based AR interactions.",
  keywords: [
    "Revia",
    "spatial memories",
    "AR memories",
    "augmented reality",
    "memory experiences",
  ],
  openGraph: {
    title: "Revia — Spatial memories",
    description:
      "Create, save, and revisit personal moments through object-based AR interactions.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfbff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
