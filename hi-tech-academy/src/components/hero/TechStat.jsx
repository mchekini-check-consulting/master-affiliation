import React from 'react';

const TechStat = ({ value, label, icon }) => (
  <div className="group relative flex flex-col gap-1 border-l border-white/20 pl-6 transition-colors hover:border-white/50">
    <div className="absolute left-0 top-0 h-0 w-[2px] bg-white transition-all duration-500 group-hover:h-full" />
    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/60">{label}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-3xl font-bold tracking-tighter text-white">{value}</span>
      <span className="text-white/40">{icon}</span>
    </div>
  </div>
);

export default TechStat;