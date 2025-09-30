// src/components/SkeletonCard.jsx
import React from "react";

export default function SkeletonCard() {
  return (
    <div className="relative bg-white/30 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl overflow-hidden shadow-md animate-pulse border border-gray-200/40 transition-all duration-300">
      
      {/* Image Skeleton */}
      <div className="w-full h-48 md:h-40 bg-gray-300 dark:bg-gray-700 rounded-t-3xl overflow-hidden relative">
        {/* Optional logo overlay */}
        <div className="absolute top-3 left-3 w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-gray-400 dark:text-gray-300">Logo</span>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col gap-3">
        {/* Restaurant Name */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>

        {/* Rating & Cuisine */}
        <div className="flex justify-between items-center gap-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/6"></div>
        </div>

        {/* Address / Delivery Time */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>

        {/* Button Skeleton */}
        <div className="mt-2 h-8 bg-gradient-to-r from-red-300 to-red-400 rounded-2xl shadow-sm"></div>
      </div>

      {/* Floating badge (optional) */}
      <div className="absolute top-3 right-3 w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full shadow-sm"></div>
    </div>
  );
}
