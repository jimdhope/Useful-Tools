
import type { Metadata } from 'next';
import './slideshow.css';
import { ThemeToggle } from '@/components/theme-toggle';

export const metadata: Metadata = {
  title: 'SLC Sessions',
  description: 'Interactive Slideshow for Call Scoring',
};

export default function SlideshowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="slideshow-theme h-screen w-screen bg-background text-foreground relative">
          <div className="absolute top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
      </div>
  );
}
