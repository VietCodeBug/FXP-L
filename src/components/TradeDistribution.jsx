import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatNumber, formatPercent } from './dashboardMetrics';

const COLORS = ['#22c55e', '#f43f5e'];

const LegendRow = ({ color, label, value }) => (
  <div className="flex items-center justify-between gap-3">
    <div className="flex items-center gap-2 text-sm text-slate-300">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </div>
    <span className="text-sm font-semibold text-white">{value}</span>
  </div>
);

const TradeDistribution = ({ snapshot }) => {
  const data = [
    { name: 'Thắng', value: snapshot?.winTotal ?? 0 },
    { name: 'Thua', value: snapshot?.lossTotal ?? 0 },
  ];

  return (
    <div className="panel-surface rounded-[24px] border border-white/8 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">Phân bổ lệnh</div>
        <div className="text-sm text-slate-500">{formatNumber(snapshot?.positionsCount ?? 0)} lệnh mở</div>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={102}
              startAngle={220}
              endAngle={-40}
              paddingAngle={3}
              cornerRadius={8}
              stroke="rgba(15, 23, 42, 0.9)"
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index]} />
              ))}
            </Pie>
            <text x="50%" y="48%" textAnchor="middle" fill="#ffffff" className="font-display" fontSize="28" fontWeight="700">
              {formatPercent(snapshot?.winRateTotal ?? 0)}
            </text>
            <text x="50%" y="58%" textAnchor="middle" fill="#64748b" fontSize="12">
              TỈ LỆ THẮNG
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        <LegendRow color={COLORS[0]} label="Tổng thắng" value={formatNumber(snapshot?.winTotal ?? 0)} />
        <LegendRow color={COLORS[1]} label="Tổng thua" value={formatNumber(snapshot?.lossTotal ?? 0)} />
      </div>
    </div>
  );
};

export default TradeDistribution;
