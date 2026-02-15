export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm h-full flex flex-col">
            {/* Image Skeleton */}
            <div className="aspect-square bg-gray-100 animate-pulse relative" />

            {/* Content Skeleton */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-1">
                    {/* Category */}
                    <div className="h-3 w-20 bg-gray-100 rounded-full mb-2 animate-pulse" />
                    {/* Title */}
                    <div className="space-y-1.5 mb-2">
                        <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                        <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
                    </div>
                    {/* Rating */}
                    <div className="flex gap-1 mt-2">
                        <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>

                <div className="mt-auto pt-4">
                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-4">
                        <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                    </div>

                    {/* Button */}
                    <div className="h-10 w-full bg-gray-100 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );
}
