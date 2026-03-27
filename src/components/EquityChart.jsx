import React from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from './dashboardMetrics';

const TooltipBox = ({ active, payload }) => {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c1118]/95 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-500">{point.time}</div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Số dư</span>
          <span className="font-semibold text-blue-300">{formatCurrency(point.balance)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Vốn thực</span>
          <span className="font-semibold text-violet-300">{formatCurrency(point.equity)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Lãi nổi</span>
          <span className={`font-semibold ${point.floating >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {formatCurrency(point.floating, { signed: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

const EquityChart = ({ data }) => {
  return (
    <div className="panel-surface rounded-[24px] border border-white/8 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">Số dư / Vốn thực realtime</div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
            Số dư
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
            Vốn thực
          </span>
        </div>
      </div>

      <div className="h-[420px]">
        {data.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 6, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0.04} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} minTickGap={22} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={68}
                tickFormatter={(value) => formatCurrency(value, { compact: true })}
              />
              <Tooltip content={<TooltipBox />} cursor={{ stroke: 'rgba(168,85,247,0.35)', strokeWidth: 1 }} />

              <Area type="monotone" dataKey="balance" stroke="transparent" fill="url(#balanceFill)" isAnimationActive={false} />
              <Area type="monotone" dataKey="equity" stroke="transparent" fill="url(#equityFill)" isAnimationActive={false} />

              <Line
                type="monotone"
                dataKey="balance"
                stroke="#3b82f6"
                strokeWidth={2.2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6', stroke: '#0c1118', strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="#a855f7"
                strokeWidth={2.6}
                dot={false}
                activeDot={{ r: 4, fill: '#a855f7', stroke: '#0c1118', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
            Đang chờ dữ liệu...
          </div>
        )}
      </div>
    </div>
  );
};

export default EquityChart;
