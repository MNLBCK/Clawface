import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

export const metadata: Metadata = { title: 'Macht-Es-Euch-Schön', description: 'Wohnungsplaner für Aufgaben, Räume und Einkauf.', manifest: '/manifest.webmanifest', appleWebApp: { capable: true, title: 'Wohnungsplaner' } };
export const viewport: Viewport = { themeColor: '#b86f52', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body><ServiceWorkerRegistration />{children}</body></html>;
}
