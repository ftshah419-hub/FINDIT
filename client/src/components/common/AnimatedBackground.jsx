import React from 'react';

export const AnimatedBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none"
    >
      {/* Subtle Electric Blue Ambient Orb - Top Left */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#2457E8]/10 dark:bg-[#2457E8]/15 blur-[100px] animate-float-slow"
      />

      {/* Subtle Accent Blue Orb - Bottom Right */}
      <div
        className="absolute -bottom-36 -right-36 w-[420px] h-[420px] rounded-full bg-[#4D8DFF]/10 dark:bg-[#4D8DFF]/12 blur-[120px] animate-float-reverse"
      />

      {/* Center Subtle Pulse */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#101C36]/[0.03] dark:bg-[#4D8DFF]/[0.04] blur-[140px] animate-pulse-subtle"
      />
    </div>
  );
};
