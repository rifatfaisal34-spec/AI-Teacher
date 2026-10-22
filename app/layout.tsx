import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Teacher",
  description: "Adaptive tutor that personalizes to learner pace and gaps",
  openGraph: {
    title: "AI Teacher",
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
    <html lang="en" className="h-full bg-slate-950 text-slate-100">
      <body className="min-h-full font-sans antialiased bg-slate-950 text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
        {children}
      </body>
    </html>
  );
}
