import React from 'react';

const toneStyles = {
  blue: {
    icon: 'bg-blue-500/14 text-blue-300',
    sub: 'text-blue-300',
  },
  purple: {
    icon: 'bg-violet-500/14 text-violet-300',
    sub: 'text-violet-300',
  },
  green: {
    icon: 'bg-emerald-500/14 text-emerald-300',
    sub: 'text-emerald-300',
  },
  orange: {
    icon: 'bg-amber-500/14 text-amber-300',
    sub: 'text-amber-300',
  },
  red: {
    icon: 'bg-rose-500/14 text-rose-300',
    sub: 'text-rose-300',
  },
};

const iconMap = {
  wallet: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 8.5A2.5 2.5 0 0 1 6.5 6H18a2 2 0 0 1 2 2v1.5M4 8.5v7A2.5 2.5 0 0 0 6.5 18H18a2 2 0 0 0 2-2v-6.5a1.5 1.5 0 0 0-1.5-1.5H6.5A2.5 2.5 0 0 1 4 5.5v3Zm12.5 3.5h.01v.01h-.01V12Z" />
  ),
  pulse: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 12h4l2.5-5 4 10 2.5-5H21" />
  ),
  arrow: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M5 15l4-4 4 4 6-6M15 9h4v4" />
  ),
  percent: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 5 5 19" />
      <circle cx="7" cy="7" r="2.2" strokeWidth="1.8" />
      <circle cx="17" cy="17" r="2.2" strokeWidth="1.8" />
    </>
  ),
};

const StatCard = ({ title, value, subtitle, tone = 'blue', icon = 'wallet', loading = false }) => {
  const palette = toneStyles[tone] || toneStyles.blue;

  return (
    <div className="panel-surface rounded-[24px] border border-white/8 p-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
          {title}
        </span>

        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${palette.icon}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
            {iconMap[icon] || iconMap.wallet}
          </svg>
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-10 w-2/3 animate-pulse rounded-full bg-white/8" />
          <div className="h-4 w-1/3 animate-pulse rounded-full bg-white/6" />
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-[2rem] font-display font-semibold tracking-[-0.05em] text-white">
            {value}
          </div>
          <div className={`text-sm font-medium ${palette.sub}`}>
            {subtitle}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatCard;
