import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Layout as MainLayout } from "../src/components/Layout";

export const metadata: Metadata = {
    title: "Bot & Beam | Future of Tech",
    description: "Explore the latest in coding, design, and architecture.",
    icons: {
        icon: '/favicon.svg',
    },
    openGraph: {
        title: "Bot & Beam | Future of Tech",
        description: "Explore the latest in coding, design, and architecture.",
        siteName: "Bot & Beam",
    }
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <link
                    rel="stylesheet"
                    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
                />
            </head>
            <body suppressHydrationWarning>
                <Providers>
                    <MainLayout>
                        {children}
                    </MainLayout>
                </Providers>
            </body>
        </html>
    );
}
