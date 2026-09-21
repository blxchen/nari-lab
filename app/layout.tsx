import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://blxchen.github.io/nari-lab/'),
  title: 'NARI LAB - Typhoon Intelligence',
  description: 'A physics-driven 3D typhoon simulation, historical storm archive, and tropical cyclone analysis laboratory.',
  openGraph: {
    title: 'NARI LAB - Typhoon Intelligence',
    description: 'Model, explore, and analyze physics-driven tropical cyclones on an interactive 3D globe.',
    type: 'website',
    images: [{ url: '/nari-lab/og.png', width: 1536, height: 1024, alt: 'NARI LAB physics-driven typhoon intelligence' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NARI LAB - Typhoon Intelligence',
    description: 'Model, explore, and analyze physics-driven tropical cyclones on an interactive 3D globe.',
    images: ['/nari-lab/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
