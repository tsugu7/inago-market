# ProjectX Gateway API 仕様書

## 概要

ProjectX Gateway APIは、プロップファームと評価プロバイダー向けの完全なエンドツーエンドソリューションを提供するトレーディングプラットフォームです。このAPIを使用することで、アカウントのカスタマイズ、リスクルールとモニタリング、清算、統計、および権限設定などの機能にアクセスできます。

## 認証

ProjectX Gateway APIでは、JSON Web Token（JWT）を使用して認証を行います。認証には以下の2つの方法があります：

1. **APIキーによる認証**
   - ユーザー名とAPIキーを使用して認証を行います
   - 認証後、24時間有効なセッショントークンが発行されます

2. **承認されたアプリケーションによる認証**
   - ユーザー名、パスワード、appId、verifyKeyを使用して認証を行います
   - 認証後、24時間有効なセッショントークンが発行されます

認証後は、すべてのリクエストのAuthorizationヘッダーにBearerトークンとしてセッショントークンを含める必要があります。

## 接続URL

各環境（Alpha Ticks, Blue Guardian, Blusky, E8X, Funding Futures, The Futures Desk, Futures Elite, FXI, FuturesGoat, FundedTick, TickTrader, TopOneFutures, Topstep, XTX, 3Funding）ごとに異なる接続URLが提供されています。

## 主要エンドポイント

### アカウント関連

- **アカウント検索**: `/api/account/search`
  - アクティブなアカウントのリストを取得します

### マーケットデータ関連

- **バーの取得**: `/api/History/retrieveBars`
  - 指定した契約の履歴データ（OHLC）を取得します
  
- **契約の検索**: `/api/Contract/search`
  - 利用可能な契約を検索します
  
- **IDによる契約の検索**: `/api/Contract/searchById`
  - 特定のIDを持つ契約を検索します

### 注文関連

- **注文の検索**: `/api/Order/search`
  - 指定したアカウントの注文履歴を検索します
  
- **未執行注文の検索**: `/api/Order/searchOpen`
  - 指定したアカウントの未執行注文を検索します
  
- **注文の発注**: `/api/Order/place`
  - 新しい注文を発注します
  
- **注文のキャンセル**: `/api/Order/cancel`
  - 既存の注文をキャンセルします
  
- **注文の変更**: `/api/Order/modify`
  - 既存の注文を変更します

### ポジション関連

- **ポジションのクローズ**: `/api/Position/closeContract`
  - 指定した契約のポジションをクローズします
  
- **ポジションの一部クローズ**: `/api/Position/partialCloseContract`
  - 指定した契約のポジションを一部クローズします
  
- **ポジションの検索**: `/api/Position/searchOpen`
  - 未決済のポジションを検索します

### 取引関連

- **取引の検索**: `/api/Trade/search`
  - 指定したアカウントの取引履歴を検索します

## リアルタイム更新

ProjectX Gateway APIは、SignalRライブラリ（WebSocket経由）を使用してリアルタイムデータを提供します。以下の2つのハブがあります：

1. **ユーザーハブ**: ユーザーのアカウント、注文、ポジションへのリアルタイム更新を提供します
2. **マーケットハブ**: 市場取引イベント、DOM（Depth of Market）イベントなどの市場データを提供します

## サンプルアプリケーション: inago-market

inago-marketは、ProjectX Gateway APIを使用してリアルタイムの市場データを可視化するWebアプリケーションです。

### 機能

- リアルタイムの価格データ表示
- 出来高チャートの表示
- 複数の契約の同時モニタリング
- WebSocketを使用したリアルタイムデータ更新

### 技術スタック

- **フロントエンド**: React, D3.js
- **バックエンド**: Node.js, Express
- **通信**: Socket.IO (WebSocket)
- **ビルドツール**: Webpack, Babel

### アーキテクチャ

1. **サーバーサイド**:
   - Express.jsサーバーがRESTful APIとWebSocketエンドポイントを提供
   - Socket.IOを使用してクライアントにリアルタイムデータを送信
   - モックデータ生成機能（デモ用）

2. **クライアントサイド**:
   - ReactコンポーネントベースのUI
   - D3.jsを使用したデータ可視化
   - Socket.IO-clientを使用したリアルタイムデータの受信
   - レスポンシブデザイン

### コンポーネント構成

- **ContractSelector**: 表示する契約を選択するドロップダウン
- **VolumeChart**: 選択された契約の出来高チャート
- **ContractGrid**: すべての契約の概要を表示するグリッド

### データフロー

1. サーバーがモックデータを生成（または実際のAPIからデータを取得）
2. WebSocketを通じてクライアントにデータを送信
3. クライアントがデータを受信し、状態を更新
4. UIコンポーネントが更新された状態に基づいて再レンダリング

### 使用方法

1. サーバーを起動: `npm run dev`
2. ブラウザで `http://localhost:3000` にアクセス
3. 契約セレクターから表示したい契約を選択
4. リアルタイムの価格と出来高データを確認

### 拡張可能性

- 実際のProjectX Gateway APIとの接続
- 追加のチャートタイプ（ローソク足、ライン等）
- ユーザー認証の実装
- 注文発注機能の追加
- モバイルアプリケーションの開発
