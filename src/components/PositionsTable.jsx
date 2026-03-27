import React from 'react';
import { formatCurrency, formatLots, formatPositionType, formatNumber, getValueTone } from './dashboardMetrics';

const toneText = {
  positive: 'text-emerald-300',
  negative: 'text-rose-300',
  neutral: 'text-slate-100',
};

const badgeStyles = {
  Mua: 'border-blue-400/20 bg-blue-400/10 text-blue-200',
  Bán: 'border-orange-400/20 bg-orange-400/10 text-orange-200',
};

const PositionsTable = ({ snapshot }) => {
  const positions = snapshot?.positions ?? [];

  return (
    <div className="panel-surface rounded-[24px] border border-white/8 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-semibold text-white">Vị thế đang mở</div>
        <div className="text-sm text-slate-500">{formatNumber(snapshot?.positionsCount ?? 0)} vị thế</div>
      </div>

      {positions.length ? (
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <div className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1fr] gap-3 bg-white/[0.04] px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-500">
            <span>Mã</span>
            <span>Lệnh</span>
            <span>KL</span>
            <span className="text-right">Lãi/lỗ</span>
          </div>

          <div className="divide-y divide-white/6">
            {positions.map((position) => {
              const tone = getValueTone(position.profit);
              const typeLabel = formatPositionType(position.type);

              return (
                <div key={position.id} className="grid grid-cols-[1.1fr_0.8fr_0.8fr_1fr] gap-3 px-4 py-3 text-sm">
                  <span className="font-semibold text-white">{position.symbol}</span>
                  <span>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${badgeStyles[typeLabel]}`}>
                      {typeLabel}
                    </span>
                  </span>
                  <span className="text-slate-300">{formatLots(position.volume)}</span>
                  <span className={`text-right font-semibold ${toneText[tone] || toneText.neutral}`}>
                    {formatCurrency(position.profit, { signed: true })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center text-sm text-slate-500">
          Không có vị thế mở
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Lệnh lời</div>
          <div className="mt-2 text-lg font-display font-semibold text-emerald-300">{formatNumber(snapshot?.positivePositions ?? 0)}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Lệnh lỗ</div>
          <div className="mt-2 text-lg font-display font-semibold text-rose-300">{formatNumber(snapshot?.negativePositions ?? 0)}</div>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Tổng lãi nổi</div>
          <div className={`mt-2 text-lg font-display font-semibold ${toneText[getValueTone(snapshot?.positionProfit)] || toneText.neutral}`}>
            {formatCurrency(snapshot?.positionProfit ?? 0, { signed: true })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionsTable;
