import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "General multi tools",
  description: "A hub of powerful web-based utilities",
  icons: {
    icon: "/icon.svg",
  },
};

import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <div style={{ flex: 1 }}>{children}</div>
        <footer style={{ 
          background: 'var(--footer)', 
          color: '#fff', 
          textAlign: 'center', 
          padding: '1.5rem', 
          fontSize: '0.9rem',
          fontWeight: 500,
          borderTop: '2px solid var(--border)'
        }}>
          © 2026 ChaoprayaSoft, THAILAND | Contact : tiawongsombat@gmail.com | Tel : 0909739266 | LineID : yok_tiaw
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
