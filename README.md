# inago-market

リアルタイム市場データ可視化Webアプリケーション

## ドキュメント

- [API仕様書](basic-spec.md) - ProjectX Gateway APIの詳細仕様
- [設計ドキュメント](designdoc.md) - アプリケーションの設計詳細

## 概要

inago-marketは、ProjectX Gateway APIを使用してリアルタイムの市場データを可視化するWebアプリケーションです。このアプリケーションでは、複数の先物契約の価格データと出来高をリアルタイムで表示し、トレーダーが市場の動向を素早く把握できるようにします。

## 機能

- リアルタイムの価格データ表示
- 出来高チャートの可視化
- 複数の契約の同時モニタリング
- WebSocketを使用したリアルタイムデータ更新
- レスポンシブデザイン

## 技術スタック

- **フロントエンド**: React, D3.js
- **バックエンド**: Node.js, Express
- **通信**: Socket.IO (WebSocket)
- **ビルドツール**: Webpack, Babel

## インストール

```bash
# リポジトリのクローン
git clone https://github.com/yourusername/inago-market.git
cd inago-market

# 依存関係のインストール
npm install
```

## 使用方法

### 開発モード

```bash
# 開発サーバーの起動
npm run dev
```

### 本番ビルド

```bash
# アプリケーションのビルド
npm run build

# 本番サーバーの起動
npm start
```

ブラウザで http://localhost:3000 にアクセスすると、アプリケーションが表示されます。

## アプリケーション構成

### コンポーネント

- **ContractSelector**: 表示する契約を選択するドロップダウン
- **VolumeChart**: 選択された契約の出来高チャート
- **ContractGrid**: すべての契約の概要を表示するグリッド

### データフロー

1. サーバーがモックデータを生成（または実際のAPIからデータを取得）
2. WebSocketを通じてクライアントにデータを送信
3. クライアントがデータを受信し、状態を更新
4. UIコンポーネントが更新された状態に基づいて再レンダリング

## 設定

現在のバージョンでは、以下の先物契約をサポートしています：

- E-mini S&P 500 (ES)
- Micro E-mini S&P 500 (MSE)
- E-mini NASDAQ-100 (NQ)
- Micro E-mini NASDAQ-100 (MNQ)
- 原油先物 (CL)
- Micro 原油先物 (MCL)
- 金先物 (GC)
- Micro 金先物 (MGC)

## 拡張計画

- 実際のProjectX Gateway APIとの接続
- 追加のチャートタイプ（ローソク足、ライン等）
- ユーザー認証の実装
- 注文発注機能の追加
- モバイルアプリケーションの開発

## ライセンス

MIT

## 謝辞

このプロジェクトは、ProjectX Gateway APIのドキュメントとサンプルコードを参考にしています。
