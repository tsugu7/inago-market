const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

// サーバーの設定
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ミドルウェアの設定
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 利用可能な契約リスト
const availableContracts = [
  { id: 'ES', name: 'E-mini S&P 500' },
  { id: 'MSE', name: 'Micro E-mini S&P 500' },
  { id: 'NQ', name: 'E-mini NASDAQ-100' },
  { id: 'MNQ', name: 'Micro E-mini NASDAQ-100' },
  { id: 'CL', name: '原油先物' },
  { id: 'MCL', name: 'Micro 原油先物' },
  { id: 'GC', name: '金先物' },
  { id: 'MGC', name: 'Micro 金先物' }
];

// 契約ごとの基準価格
const basePrices = {
  'ES': 5200,
  'MSE': 5200,
  'NQ': 18500,
  'MNQ': 18500,
  'CL': 75,
  'MCL': 75,
  'GC': 2300,
  'MGC': 2300
};

// 契約ごとの現在価格
const currentPrices = { ...basePrices };

// 契約ごとのトレンド
const trends = {};

// 契約ごとの累積出来高
const cumulativeVolumes = {};

// トレンドを初期化
Object.keys(basePrices).forEach(contract => {
  trends[contract] = Math.random() > 0.5 ? 1 : -1;
  cumulativeVolumes[contract] = 0;
});

// 契約ごとの価格変動の大きさ
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

// モックデータを生成する関数
const generateMockData = (contractId) => {
  // トレンドをランダムに変更（5%の確率）
  if (Math.random() < 0.05) {
    trends[contractId] = -trends[contractId];
  }

  // 価格の変動を計算
  const priceChange = (Math.random() * volatility[contractId]) * trends[contractId];
  currentPrices[contractId] += priceChange;

  // 出来高をランダムに生成
  const volumeChange = Math.floor(Math.random() * 20) * (Math.random() < 0.7 ? trends[contractId] : -trends[contractId]);
  
  // 累積出来高を更新
  cumulativeVolumes[contractId] += volumeChange;

  // 10%の確率で大きな出来高変動を発生させる
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

// 10秒ごとに累積出来高をリセット
setInterval(() => {
  Object.keys(cumulativeVolumes).forEach(contract => {
    cumulativeVolumes[contract] = 0;
  });
}, 10000);

// WebSocketの接続処理
io.on('connection', (socket) => {
  console.log('クライアント接続: ', socket.id);

  // 契約リストを送信
  socket.emit('contracts', availableContracts);

  // 1秒ごとにデータを更新して送信
  const interval = setInterval(() => {
    const contractsData = availableContracts.map(contract => {
      const mockData = generateMockData(contract.id);
      return {
        id: contract.id,
        name: contract.name, // 契約名を空文字列に設定
        price: mockData.price,
        cumulativeVolume: mockData.volume,
        isPositive: mockData.isPositive
      };
    });

    socket.emit('market_data', contractsData);
  }, 1000);

  // 切断時の処理
  socket.on('disconnect', () => {
    console.log('クライアント切断: ', socket.id);
    clearInterval(interval);
  });
});

// ルートへのアクセス
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// APIエンドポイント: 契約リスト取得
app.get('/api/contracts', (req, res) => {
  res.json(availableContracts);
});

// サーバー起動
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`サーバー起動: http://localhost:${PORT}`);
});
