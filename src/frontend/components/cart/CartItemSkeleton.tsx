"use client";

import React from "react";

export const CartItemSkeleton: React.FC = () => {
    return (
        <div className="flex gap-4 py-4 animate-pulse">
            <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="flex items-center justify-between pt-1">
                    <div className="h-8 bg-muted rounded w-24" />
                    <div className="h-4 bg-muted rounded w-16" />
                </div>
            </div>
        </div>
    );
};
