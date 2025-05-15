// 契約ごとの基準価格（リアルな価格帯を模倣）
const basePrices = {
  'ES': 5200, // E-mini S&P 500
  'MSE': 5200, // Micro E-mini S&P 500（ESと同じ価格帯）
  'NQ': 18500, // E-mini NASDAQ-100
  'MNQ': 18500, // Micro E-mini NASDAQ-100（NQと同じ価格帯）
  'CL': 75, // 原油先物
  'MCL': 75, // Micro 原油先物（CLと同じ価格帯）
  'GC': 2300, // 金先物
  'MGC': 2300 // Micro 金先物（GCと同じ価格帯）
};

// 契約ごとの価格変動の大きさ（ボラティリティ）
const volatility = {
  'ES': 5,
  'MSE': 5,
  'NQ': 20,
  'MNQ': 20,
  'CL': 0.5,
  'MCL': 0.5,
  'GC': 3,
  'MGC': 3
};

// 契約ごとの現在価格（シミュレーション中に更新）
const currentPrices = { ...basePrices };

// 契約ごとのトレンド（上昇/下降傾向、時々変化）
const trends = {};

// 契約ごとの累積出来高
const cumulativeVolumes = {};

// トレンドを初期化
Object.keys(basePrices).forEach(contract => {
  trends[contract] = Math.random() > 0.5 ? 1 : -1;
  cumulativeVolumes[contract] = 0;
});

/**
 * モックデータを生成する関数
 * @param {string} contractId - 契約ID
 * @returns {Object} 生成されたモックデータ
 */
export const generateMockData = (contractId) => {
  // トレンドをランダムに変更（5%の確率）
  if (Math.random() < 0.05) {
    trends[contractId] = -trends[contractId];
  }

  // 価格の変動を計算
  const priceChange = (Math.random() * volatility[contractId]) * trends[contractId];
  currentPrices[contractId] += priceChange;

  // 出来高をランダムに生成（0〜20の範囲、トレンドに沿った符号）
  const volumeChange = Math.floor(Math.random() * 20) * (Math.random() < 0.7 ? trends[contractId] : -trends[contractId]);
  
  // 累積出来高を更新（10秒ごとにリセットされると仮定）
  if (!cumulativeVolumes[contractId]) {
    cumulativeVolumes[contractId] = 0;
  }
  cumulativeVolumes[contractId] += volumeChange;

  // 10%の確率で大きな出来高変動を発生させる（市場の急変を模倣）
  if (Math.random() < 0.1) {
    const bigMove = Math.floor(Math.random() * 100) * (Math.random() < 0.5 ? 1 : -1);
    cumulativeVolumes[contractId] += bigMove;
  }

  return {
    price: currentPrices[contractId],
    volume: cumulativeVolumes[contractId],
    isPositive: cumulativeVolumes[contractId] >= 0
  };
};

/**
 * すべての契約のモックデータをリセットする関数
 */
export const resetMockData = () => {
  Object.keys(basePrices).forEach(contract => {
    currentPrices[contract] = basePrices[contract];
    cumulativeVolumes[contract] = 0;
    trends[contract] = Math.random() > 0.5 ? 1 : -1;
  });
};
