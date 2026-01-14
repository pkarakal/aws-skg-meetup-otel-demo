"use client";

import {useEffect} from "react";
import {useCartStore} from "@/stores/cart";

export function StoreHydration() {
    useEffect(() => {
        useCartStore.persist.rehydrate();
    }, []);

    return null;
}
