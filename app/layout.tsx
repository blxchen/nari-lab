import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://blxchen.github.io/nari-lab/'),
  title: 'NARI LAB - Typhoon Intelligence',
  description: 'A high-performance WebGL typhoon simulator with local data collection, validated CSV/JSON imports, analysis, and downloadable scientific plots.',
  openGraph: {
    title: 'NARI LAB - Typhoon Intelligence',
    description: 'Collect, model, and analyze tropical cyclone data on an interactive WebGL globe.',
    type: 'website',
    images: [{ url: '/nari-lab/og.png', width: 1536, height: 1024, alt: 'NARI LAB physics-driven typhoon intelligence' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NARI LAB - Typhoon Intelligence',
    description: 'Collect, model, and analyze tropical cyclone data on an interactive WebGL globe.',
    images: ['/nari-lab/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
