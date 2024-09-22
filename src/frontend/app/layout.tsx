import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import React from "react";
import {Toaster} from "@/components/ui/sonner";

const inter = Inter({subsets: ["latin"], variable: "--font-sans"});

export const metadata: Metadata = {
    title: "Telescope e-shop",
    description: "Buy the best telescopes online",
};

export default function RootLayout({children}: Readonly<{children: React.ReactNode;}>) {
    return (
        <html lang="en">
        <body className={`${inter.variable}`}>
        <div className="grid h-screen grid-rows-[auto,1fr]">
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <main className="overflow-y-scroll">
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
