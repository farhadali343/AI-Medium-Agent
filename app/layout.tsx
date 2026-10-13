import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Medium AI Research & Article Agent',
  description: 'Deep web research, Reddit sentiment calibration, and humanized SEO article generation for Medium publications.',
  openGraph: {
    title: 'Medium AI Research & Article Agent',
    description: 'Deep web research, Reddit sentiment calibration, and humanized SEO article generation for Medium publications.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Medium AI Research & Article Agent',
    description: 'Deep web research, Reddit sentiment calibration, and humanized SEO article generation for Medium publications.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
