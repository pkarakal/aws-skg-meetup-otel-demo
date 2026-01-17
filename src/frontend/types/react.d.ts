import { JSX } from 'react';

declare global {
    namespace JSX {
        type ElementType =
            | keyof JSX.IntrinsicElements
            | ((props: any) => Promise<JSX.Element | null> | JSX.Element | null);
    }
}
