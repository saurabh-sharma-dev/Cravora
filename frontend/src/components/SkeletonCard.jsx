// src/components/SkeletonCard.jsx – Matches RestaurantCard layout
import React from "react";

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-stone-200/80 animate-pulse">
      <div className="w-full h-40 sm:h-44 bg-surface-200" />
      <div className="p-3 sm:p-4 space-y-2">
        <div className="h-5 bg-surface-200 rounded w-3/4" />
        <div className="h-4 bg-surface-200 rounded w-1/2" />
        <div className="h-4 bg-surface-200 rounded w-2/3" />
        <div className="flex justify-between pt-2 border-t border-stone-100">
          <div className="h-4 bg-surface-200 rounded w-24" />
          <div className="h-4 bg-surface-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}
