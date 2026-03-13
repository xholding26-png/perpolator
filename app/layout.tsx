import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import WalletProvider from '@/components/WalletProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: 'PERPOLATOR — Permissionless Perpetual Futures',
  description: 'Launch a leveraged trading market for any Solana token in 60 seconds. Up to 20x leverage. Coin-margined. Fully on-chain.',
  openGraph: {
    title: 'PERPOLATOR',
    description: 'Any token. Any leverage. No permission needed. Permissionless perpetual futures on Solana.',
    url: 'https://perpolator.com',
    siteName: 'Perpolator',
    type: 'website',
    images: [
      {
        url: 'https://perpolator.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Perpolator — Any token. Any leverage. No permission needed.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PERPOLATOR — Permissionless Perps on Solana',
    description: 'Any token. Any leverage. No permission needed.',
    images: ['https://perpolator.com/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-black text-white antialiased min-h-screen">
        <WalletProvider>
          <Navbar />
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
