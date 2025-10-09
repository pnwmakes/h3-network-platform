import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'H3 Network - Hope, Help, Humor',
    description:
        'A community for justice-impacted people and those who work within criminal justice. Find Hope, Help, and Humor through content covering addiction recovery, reentry support, and criminal justice reform.',
    icons: {
        icon: '/logos/H3 Logo.png',
        shortcut: '/logos/H3 Logo.png',
        apple: '/logos/H3 Logo.png',
    },
    openGraph: {
        title: 'H3 Network - Hope, Help, Humor',
        description: 'A community for justice-impacted people and those who work within criminal justice. Find Hope, Help, and Humor through content covering addiction recovery, reentry support, and criminal justice reform.',
        images: ['/logos/H3 Logo_with HopeHelpHumor.png'],
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'H3 Network - Hope, Help, Humor',
        description: 'A community for justice-impacted people and those who work within criminal justice.',
        images: ['/logos/H3 Logo_with HopeHelpHumor.png'],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en'>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning={true}
            >
                <Providers>
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}
