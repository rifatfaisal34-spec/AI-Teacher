import type { Metadata } from "next";
import { Newsreader, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Maya · AI Teacher",
  description: "Adaptive tutor that personalizes to learner pace and gaps",
  openGraph: {
    title: "Maya · AI Teacher",
    description: "Adaptive tutor that personalizes to learner pace and gaps",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full ${newsreader.variable} ${jakarta.variable} bg-[#0A0A0C] text-[#F4F4F5]`}
    >
      <body className="min-h-full font-sans antialiased bg-[#0A0A0C] text-[#F4F4F5] selection:bg-[#E8B288]/30 selection:text-[#E8B288]">
        {children}
      </body>
    </html>
  );
}
