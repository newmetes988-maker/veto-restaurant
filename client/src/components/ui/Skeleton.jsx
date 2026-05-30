import React from 'react';

export const SkeletonRow = () => (
  <div className="animate-pulse flex items-center gap-4 px-4 py-4 border-b border-white/[0.04]">
    <div className="flex-1">
      <div className="h-4 bg-white/10 rounded w-32 mb-2" />
      <div className="h-3 bg-white/5 rounded w-24" />
    </div>
    <div className="w-32 hidden sm:block">
      <div className="h-4 bg-white/10 rounded w-28 mb-2" />
      <div className="h-3 bg-white/5 rounded w-20" />
    </div>
    <div className="w-32 hidden md:block">
      <div className="h-4 bg-white/10 rounded w-28" />
    </div>
    <div className="w-20 hidden lg:block">
      <div className="h-4 bg-white/10 rounded w-12" />
    </div>
    <div className="w-24">
      <div className="h-6 bg-white/10 rounded-full w-20" />
    </div>
    <div className="w-24 flex justify-end gap-2">
      <div className="h-8 bg-white/10 rounded-lg w-8" />
      <div className="h-8 bg-white/10 rounded-lg w-8" />
    </div>
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="glass-panel p-4 animate-pulse">
        <div className="h-3 bg-white/10 rounded w-16 mb-2" />
        <div className="h-8 bg-white/10 rounded w-12" />
      </div>
    ))}
  </div>
);

export const SkeletonTable = () => (
  <div className="glass-panel overflow-hidden">
    <div className="h-12 bg-white/[0.02] border-b border-white/[0.04] animate-pulse" />
    {[...Array(5)].map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);
