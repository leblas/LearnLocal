import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LearnLocal – Discover Where Your Food Comes From',
  description:
    'Scan or select a food item and receive a personalized lesson about where it comes from, its environmental impact, and one local action you can take today.',
  keywords: 'local food, sustainability, farm to table, food education, community, kids learning',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
