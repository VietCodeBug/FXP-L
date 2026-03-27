import React, { useEffect, useEffectEvent, useState } from 'react';
import StatCard from './StatCard';
import EquityChart from './EquityChart';
import TradeDistribution from './TradeDistribution';
import PositionsTable from './PositionsTable';
import StatsSection from './StatsSection';
import {
  POLLING_INTERVAL_MS,
  appendHistory,
  createSnapshot,
  deriveHistoryStats,
  formatClock,
  formatCurrency,
  formatNumber,
  formatPercent,
  getFreshness,
  getValueTone,
} from './dashboardMetrics';

const DEFAULT_API_URL = '/api/dashboard';
const LEGACY_DEFAULT_API_URLS = new Set([
  'http://35.239.159.234:8000/dashboard',
  'https://35.239.159.234:8000/dashboard',
]);

const normalizeApiUrl = (value) => {
  const trimmedValue = value?.trim();

  if (!trimmedValue || LEGACY_DEFAULT_API_URLS.has(trimmedValue)) {
    return DEFAULT_API_URL;
  }

  return trimmedValue;
};

const resolveRequestUrl = (rawApiUrl) => {
  const normalizedUrl = normalizeApiUrl(rawApiUrl);

  try {
    const parsedUrl = new URL(normalizedUrl, window.location.origin);

    if (parsedUrl.origin === window.location.origin) {
      return `${parsedUrl.pathname}${parsedUrl.search}`;
    }

    return `/api/proxy?url=${encodeURIComponent(parsedUrl.toString())}`;
  } catch {
    return normalizedUrl;
  }
};

const parseErrorResponse = async (response) => {
  let message = `API error: ${response.status}`;

  try {
    const responseType = response.headers.get('content-type') || '';

    if (responseType.includes('application/json')) {
      const responseBody = await response.json();
      message = responseBody.error || message;
    } else {
      const responseBody = await response.text();
      if (responseBody) {
        message = responseBody;
      }
    }
  } catch {
    // Keep status fallback.
  }

  return message;
};

const Dashboard = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [apiUrl, setApiUrl] = useState(() => normalizeApiUrl(localStorage.getItem('trading_api_url')));
  const [editing, setEditing] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  useEffect(() => {
    setTempUrl(apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    const timerId = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const fetchData = useEffectEvent(async (signal) => {
    try {
      const response = await fetch(resolveRequestUrl(apiUrl), {
        signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(await parseErrorResponse(response));
      }

      const payload = await response.json();
      const nextSnapshot = createSnapshot(payload);

      setSnapshot(nextSnapshot);
      setHistory((current) => appendHistory(current, nextSnapshot));
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      console.error(err);
      setError(err.message === 'Failed to fetch' ? 'Không lấy được dữ liệu' : err.message);
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    setLoading(true);
    setSnapshot(null);
    setHistory([]);
    setError(null);

    const controllers = new Set();

    const runFetch = () => {
      const controller = new AbortController();
      controllers.add(controller);

      fetchData(controller.signal).finally(() => {
        controllers.delete(controller);
      });
    };

    runFetch();
    const intervalId = setInterval(runFetch, POLLING_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
      controllers.forEach((controller) => controller.abort());
      controllers.clear();
    };
  }, [apiUrl]);

  const saveUrl = (event) => {
    event.preventDefault();
    const nextApiUrl = normalizeApiUrl(tempUrl);
    setApiUrl(nextApiUrl);
    setTempUrl(nextApiUrl);
    localStorage.setItem('trading_api_url', nextApiUrl);
    setEditing(false);
  };

  const freshness = getFreshness(snapshot, now);
  const historyStats = deriveHistoryStats(history);
  const floatingTone = getValueTone(snapshot?.floating);
  const profitTodayTone = getValueTone(snapshot?.profitToday);
  const syncClass = error
    ? 'border-rose-400/20 bg-rose-400/10 text-rose-200'
    : freshness.state === 'stale'
      ? 'border-amber-400/20 bg-amber-400/10 text-amber-200'
      : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200';

  return (
    <div className="dashboard-shell min-h-screen px-4 py-5 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[2rem] font-display font-semibold tracking-[-0.05em] text-white">
              Bảng thống kê realtime
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className={`rounded-full border px-3 py-1 font-medium ${syncClass}`}>
                {error ? 'Mất kết nối' : 'Đang chạy'}
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-slate-300">
                Cập nhật: {snapshot ? formatClock(snapshot.updatedAt) : '--'}
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-slate-300">
                Trễ: {snapshot ? freshness.ageLabel : '--'}
              </span>
              <span className="rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-slate-300">
                Nhịp: {(POLLING_INTERVAL_MS / 1000).toFixed(1)}s
              </span>
            </div>
          </div>

          <div className="w-full max-w-xl lg:w-[430px]">
            {editing ? (
              <form onSubmit={saveUrl} className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={tempUrl}
                  onChange={(event) => setTempUrl(event.target.value)}
                  className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[#10161f] px-4 py-3 text-sm text-white outline-none focus:border-blue-400/40"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempUrl(apiUrl);
                      setEditing(false);
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="rounded-2xl border border-blue-400/20 bg-blue-400/12 px-4 py-3 text-sm font-medium text-blue-200"
                  >
                    Lưu
                  </button>
                </div>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="w-full truncate rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-300"
                title={apiUrl}
              >
                Nguồn: {apiUrl}
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="mb-5 rounded-2xl border border-rose-400/15 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Số dư"
            value={snapshot ? formatCurrency(snapshot.balance) : '--'}
            subtitle={history.length ? `Phiên: ${formatCurrency(historyStats.sessionEquityChange, { signed: true })}` : '--'}
            tone="blue"
            icon="wallet"
            loading={loading && !snapshot}
          />
          <StatCard
            title="Vốn thực"
            value={snapshot ? formatCurrency(snapshot.equity) : '--'}
            subtitle={snapshot ? `Lãi nổi: ${formatCurrency(snapshot.floating, { signed: true })}` : '--'}
            tone="purple"
            icon="pulse"
            loading={loading && !snapshot}
          />
          <StatCard
            title="Lãi hôm nay"
            value={snapshot ? formatCurrency(snapshot.profitToday, { signed: true }) : '--'}
            subtitle={snapshot ? `${formatNumber(snapshot.tradesToday)} lệnh` : '--'}
            tone={profitTodayTone === 'negative' ? 'red' : profitTodayTone === 'positive' ? 'green' : 'orange'}
            icon="arrow"
            loading={loading && !snapshot}
          />
          <StatCard
            title="Tỉ lệ thắng"
            value={snapshot ? formatPercent(snapshot.winRateTotal) : '--'}
            subtitle={snapshot ? `Thắng ${formatNumber(snapshot.winTotal)} / Thua ${formatNumber(snapshot.lossTotal)}` : '--'}
            tone="orange"
            icon="percent"
            loading={loading && !snapshot}
          />
        </div>

        <div className="mb-5 grid gap-4 xl:grid-cols-[1.9fr_1fr]">
          <EquityChart data={history} />
          <TradeDistribution snapshot={snapshot} />
        </div>

        <div className="mb-5">
          <StatsSection snapshot={snapshot} />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <PositionsTable snapshot={snapshot} />

          <div className="panel-surface rounded-[24px] border border-white/8 p-5">
            <div className="mb-4 text-sm font-semibold text-white">Chi tiết nhanh</div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Lãi nổi</div>
                <div className={`mt-2 text-lg font-display font-semibold ${floatingTone === 'positive' ? 'text-emerald-300' : floatingTone === 'negative' ? 'text-rose-300' : 'text-slate-100'}`}>
                  {snapshot ? formatCurrency(snapshot.floating, { signed: true }) : '--'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Biến động phiên</div>
                <div className={`mt-2 text-lg font-display font-semibold ${historyStats.sessionFloatingChange >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {history.length ? formatCurrency(historyStats.sessionFloatingChange, { signed: true }) : '--'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Biên độ equity</div>
                <div className="mt-2 text-lg font-display font-semibold text-slate-100">
                  {history.length ? formatCurrency(historyStats.observedRange) : '--'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Drawdown</div>
                <div className={`mt-2 text-lg font-display font-semibold ${historyStats.maxDrawdownPct < 0 ? 'text-rose-300' : 'text-slate-100'}`}>
                  {history.length ? formatPercent(historyStats.maxDrawdownPct, { signed: true }) : '--'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Vị thế mua</div>
                <div className="mt-2 text-lg font-display font-semibold text-blue-300">
                  {snapshot ? formatNumber(snapshot.buyCount) : '--'}
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Vị thế bán</div>
                <div className="mt-2 text-lg font-display font-semibold text-orange-300">
                  {snapshot ? formatNumber(snapshot.sellCount) : '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
