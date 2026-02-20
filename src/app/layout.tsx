import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MapProvider } from "@/components/map/MapProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Eagle Eye - Real Estate Intelligence",
  description: "Advanced geospatial platform for Kerala real estate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <MapProvider>
          {children}
        </MapProvider>
      </body>
    </html>
  );
}
