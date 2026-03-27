export const POLLING_INTERVAL_MS = 2000;
export const MAX_HISTORY_POINTS = 120;

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toInteger = (value, fallback = 0) => Math.max(0, Math.round(toNumber(value, fallback)));

const formatDecimal = (value, digits = 2) => (
  toNumber(value).toLocaleString('vi-VN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
);

export const formatCurrency = (value, { signed = false, compact = false } = {}) => {
  const numericValue = toNumber(value);
  const absoluteValue = Math.abs(numericValue);
  const prefix = numericValue < 0 ? '-' : signed && numericValue > 0 ? '+' : '';

  if (compact) {
    if (absoluteValue >= 1_000_000) return `${prefix}$${formatDecimal(absoluteValue / 1_000_000, 1)}M`;
    if (absoluteValue >= 1_000) return `${prefix}$${formatDecimal(absoluteValue / 1_000, 1)}K`;
  }

  return `${prefix}$${formatDecimal(absoluteValue, 2)}`;
};

export const formatNumber = (value, digits = 0) => (
  toNumber(value).toLocaleString('vi-VN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
);

export const formatPercent = (value, { signed = false, digits = 2 } = {}) => {
  const numericValue = toNumber(value);
  const prefix = numericValue < 0 ? '-' : signed && numericValue > 0 ? '+' : '';
  return `${prefix}${formatDecimal(Math.abs(numericValue), digits)}%`;
};

export const formatLots = (value) => `${formatNumber(value, 2)} lot`;

export const formatClock = (value) => (
  new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(value)
);

export const formatRelativeAge = (value, now = Date.now()) => {
  const ageSeconds = Math.max(0, Math.round((now - value.getTime()) / 1000));

  if (ageSeconds < 3) return 'Vừa xong';
  if (ageSeconds < 60) return `${ageSeconds}s`;

  const minutes = Math.floor(ageSeconds / 60);
  const seconds = ageSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

export const getValueTone = (value) => {
  const numericValue = toNumber(value);
  if (numericValue > 0) return 'positive';
  if (numericValue < 0) return 'negative';
  return 'neutral';
};

export const formatPositionType = (value) => (Number(value) === 0 ? 'Mua' : 'Bán');

export const createSnapshot = (payload, receivedAt = Date.now()) => {
  const balance = toNumber(payload?.balance);
  const equity = toNumber(payload?.equity);
  const margin = toNumber(payload?.margin);
  const freeMargin = toNumber(payload?.free_margin);
  const sourceFloating = toNumber(payload?.floating);
  const floating = equity - balance;
  const profitToday = toNumber(payload?.profit_today);
  const tradesTodaySource = toInteger(payload?.trades_today);
  const winToday = toInteger(payload?.win_today);
  const lossToday = toInteger(payload?.loss_today);
  const tradesToday = Math.max(tradesTodaySource, winToday + lossToday);
  const volumeToday = toNumber(payload?.volume_today);
  const profitTotal = toNumber(payload?.profit_total);
  const winTotal = toInteger(payload?.win_total);
  const lossTotal = toInteger(payload?.loss_total);
  const volumeTotal = toNumber(payload?.volume_total);
  const positions = Array.isArray(payload?.positions)
    ? payload.positions.map((position, index) => ({
        id: `${position.symbol || 'POS'}-${index}`,
        symbol: position.symbol || '---',
        volume: toNumber(position.volume),
        profit: toNumber(position.profit),
        type: Number(position.type) || 0,
        typeLabel: formatPositionType(position.type),
      }))
    : [];
  const positionsCount = Math.max(toInteger(payload?.positions_count), positions.length);
  const timestamp = toNumber(payload?.timestamp);
  const serverTime = toNumber(payload?.server_time);
  const updatedAt = timestamp > 0 ? new Date(timestamp * 1000) : new Date(receivedAt);
  const serverAt = serverTime > 0 ? new Date(serverTime * 1000) : updatedAt;
  const totalTrades = winTotal + lossTotal;
  const winRateToday = tradesToday > 0 ? (winToday / tradesToday) * 100 : 0;
  const winRateTotal = totalTrades > 0 ? (winTotal / totalTrades) * 100 : 0;
  const marginLevel = margin > 0 ? (equity / margin) * 100 : 0;
  const usedMarginRate = equity !== 0 ? (margin / Math.abs(equity)) * 100 : 0;
  const freeMarginRate = equity !== 0 ? (freeMargin / Math.abs(equity)) * 100 : 0;
  const buyCount = positions.filter((position) => position.type === 0).length;
  const sellCount = positions.length - buyCount;
  const positivePositions = positions.filter((position) => position.profit > 0).length;
  const negativePositions = positions.filter((position) => position.profit < 0).length;
  const positionProfit = positions.reduce((total, position) => total + position.profit, 0);

  return {
    balance,
    equity,
    margin,
    freeMargin,
    floating,
    sourceFloating,
    profitToday,
    tradesToday,
    winToday,
    lossToday,
    volumeToday,
    profitTotal,
    winTotal,
    lossTotal,
    volumeTotal,
    totalTrades,
    winRateToday,
    winRateTotal,
    marginLevel,
    usedMarginRate,
    freeMarginRate,
    positionsCount,
    positions,
    buyCount,
    sellCount,
    positivePositions,
    negativePositions,
    positionProfit,
    updatedAt,
    updatedAtMs: updatedAt.getTime(),
    serverAt,
    serverAtMs: serverAt.getTime(),
    sampleLabel: formatClock(updatedAt),
  };
};

export const appendHistory = (previousHistory, snapshot) => {
  const nextPoint = {
    id: `${snapshot.updatedAtMs}-${snapshot.balance}-${snapshot.equity}-${snapshot.positionsCount}`,
    updatedAt: snapshot.updatedAtMs,
    time: snapshot.sampleLabel,
    balance: snapshot.balance,
    equity: snapshot.equity,
    floating: snapshot.floating,
    margin: snapshot.margin,
    freeMargin: snapshot.freeMargin,
  };

  const lastPoint = previousHistory.at(-1);

  if (
    lastPoint &&
    lastPoint.updatedAt === nextPoint.updatedAt &&
    lastPoint.balance === nextPoint.balance &&
    lastPoint.equity === nextPoint.equity
  ) {
    return previousHistory;
  }

  if (lastPoint && lastPoint.updatedAt === nextPoint.updatedAt) {
    return [...previousHistory.slice(0, -1), nextPoint];
  }

  return [...previousHistory, nextPoint].slice(-MAX_HISTORY_POINTS);
};

export const deriveHistoryStats = (history) => {
  if (!history.length) {
    return {
      observedRange: 0,
      sessionEquityChange: 0,
      sessionFloatingChange: 0,
      latestMove: 0,
      maxDrawdownPct: 0,
    };
  }

  const firstPoint = history[0];
  const lastPoint = history.at(-1);
  const prevPoint = history.at(-2);
  const equityValues = history.map((point) => point.equity);
  let rollingPeak = history[0].equity || 0;
  let maxDrawdownPct = 0;

  history.forEach((point) => {
    rollingPeak = Math.max(rollingPeak, point.equity);

    if (rollingPeak > 0) {
      const drawdownPct = ((point.equity - rollingPeak) / rollingPeak) * 100;
      maxDrawdownPct = Math.min(maxDrawdownPct, drawdownPct);
    }
  });

  return {
    observedRange: Math.max(...equityValues) - Math.min(...equityValues),
    sessionEquityChange: lastPoint.equity - firstPoint.equity,
    sessionFloatingChange: lastPoint.floating - firstPoint.floating,
    latestMove: prevPoint ? lastPoint.equity - prevPoint.equity : 0,
    maxDrawdownPct,
  };
};

export const getFreshness = (snapshot, now = Date.now()) => {
  if (!snapshot) {
    return {
      ageLabel: '--',
      state: 'pending',
    };
  }

  const ageMs = Math.max(0, now - snapshot.updatedAtMs);
  let state = 'fresh';

  if (ageMs > POLLING_INTERVAL_MS * 5) {
    state = 'stale';
  } else if (ageMs > POLLING_INTERVAL_MS * 2) {
    state = 'delayed';
  }

  return {
    ageLabel: formatRelativeAge(snapshot.updatedAt, now),
    state,
  };
};
