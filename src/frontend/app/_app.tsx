import type { AppProps } from 'next/app';
import Navbar from '@/components/Navbar';
import React from "react";
import {ThemeToggle} from "@/components/ThemeToggle";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Navbar />
            <ThemeToggle/>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
