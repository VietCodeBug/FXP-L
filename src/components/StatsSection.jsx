import React from 'react';
import {
  formatCurrency,
  formatLots,
  formatNumber,
  formatPercent,
  getValueTone,
} from './dashboardMetrics';

const toneText = {
  positive: 'text-emerald-300',
  negative: 'text-rose-300',
  neutral: 'text-slate-100',
};

const Item = ({ label, value, tone = 'neutral' }) => (
  <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</div>
    <div className={`mt-2 text-lg font-display font-semibold ${toneText[tone] || toneText.neutral}`}>
      {value}
    </div>
  </div>
);

const StatsSection = ({ snapshot }) => {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel-surface rounded-[24px] border border-white/8 p-5">
        <div className="mb-4 text-sm font-semibold text-white">Trong ngày</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Item label="Lệnh hôm nay" value={snapshot ? formatNumber(snapshot.tradesToday) : '--'} />
          <Item label="Thắng hôm nay" value={snapshot ? formatNumber(snapshot.winToday) : '--'} tone="positive" />
          <Item label="Thua hôm nay" value={snapshot ? formatNumber(snapshot.lossToday) : '--'} tone="negative" />
          <Item label="Tỉ lệ thắng ngày" value={snapshot ? formatPercent(snapshot.winRateToday) : '--'} tone={getValueTone((snapshot?.winRateToday ?? 0) - 50)} />
          <Item label="Khối lượng hôm nay" value={snapshot ? formatLots(snapshot.volumeToday) : '--'} />
          <Item label="Lãi hôm nay" value={snapshot ? formatCurrency(snapshot.profitToday, { signed: true }) : '--'} tone={getValueTone(snapshot?.profitToday)} />
        </div>
      </div>

      <div className="panel-surface rounded-[24px] border border-white/8 p-5">
        <div className="mb-4 text-sm font-semibold text-white">Tài khoản</div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Item label="Margin" value={snapshot ? formatCurrency(snapshot.margin) : '--'} />
          <Item label="Margin tự do" value={snapshot ? formatCurrency(snapshot.freeMargin, { signed: true }) : '--'} tone={getValueTone(snapshot?.freeMargin)} />
          <Item label="Mức ký quỹ" value={snapshot ? formatPercent(snapshot.marginLevel) : '--'} tone={getValueTone((snapshot?.marginLevel ?? 0) - 100)} />
          <Item label="Lãi nổi" value={snapshot ? formatCurrency(snapshot.floating, { signed: true }) : '--'} tone={getValueTone(snapshot?.floating)} />
          <Item label="Lợi nhuận tổng" value={snapshot ? formatCurrency(snapshot.profitTotal, { signed: true }) : '--'} tone={getValueTone(snapshot?.profitTotal)} />
          <Item label="Khối lượng tổng" value={snapshot ? formatLots(snapshot.volumeTotal) : '--'} />
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
