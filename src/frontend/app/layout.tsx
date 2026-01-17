import "./globals.css";
import type {Metadata} from "next";
import {Inter} from "next/font/google";
import {ThemeProvider} from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import React from "react";
import {Toaster} from "@/components/ui/sonner";
import {StoreHydration} from "@/components/StoreHydration";

const inter = Inter({subsets: ["latin"], variable: "--font-sans"});

export const metadata: Metadata = {
    title: "Telescope e-shop",
    description: "Buy the best telescopes online",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable}`}>
        <StoreHydration/>
        <div className="grid h-screen grid-rows-[auto,1fr]">
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <main className="overflow-y-scroll bg-background">
                    <Navbar/>
                    {children}
                </main>
                <Toaster/>
            </ThemeProvider>
        </div>
        </body>
        </html>
    );
}
