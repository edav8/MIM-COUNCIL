import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL('https://mim28.com'),
  title: 'The Salamanders · MIM’28',
  icons: { icon: [{ url: '/favicon.svg?v=salamander-1', type: 'image/svg+xml', sizes: 'any' }] },
  description: 'Explore concrete ideas for MIM life, vote for what matters, and share something new with The Salamanders.',
};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {return <html lang="en"><body>{children}</body></html>;}
