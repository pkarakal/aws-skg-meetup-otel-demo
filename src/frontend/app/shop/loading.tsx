import {Card, CardHeader, CardFooter} from "@/components/ui/card";

function ProductCardSkeleton() {
    return (
        <Card className="p-4 animate-pulse">
            <CardHeader className="relative w-full h-48 mb-4 bg-gray-200 rounded-t-lg" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
            <div className="h-6 bg-gray-200 rounded w-1/4 mt-2" />
            <CardFooter>
                <div className="h-10 bg-gray-200 rounded w-full" />
            </CardFooter>
        </Card>
    );
}

export default function Loading() {
    return (
        <div className="container mx-auto py-2">
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-auto grid-flow-row gap-6">
                {Array.from({length: 6}).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
