# inago-market

リアルタイム市場データ可視化Webアプリケーション

## 概要

inago-marketは、先物市場のデータをAPI経由でリアルタイムに取得し、視覚的に表示するWebアプリケーションです。特に売買出来高（約定数）に焦点を当て、トレーダーが市場の動向をリアルタイムで把握できるようにします。

本プロジェクトは、[ProjectX Gateway API](basic-spec.md)を利用して市場データを取得し、[イナゴフライヤー](target-spec.md)のようなリアルタイム可視化インターフェースを提供します。

## 主要機能

- **複数契約の監視**: ES, MSE, NQ, MNQ, CL, MCL, GC, MGCなどの先物契約をリアルタイムで監視
- **リアルタイム出来高表示**: 選択した契約の売買出来高を棒グラフでリアルタイム表示
- **マルチ契約情報パネル**: 全対象契約の現在価格と累積約定数を一覧表示
- **視覚的データ表現**: 買い注文（正の値）は緑色、売り注文（負の値）は赤色で表示
- **動的更新**: 棒グラフは1秒ごとに更新、5秒単位でX軸方向に進行

## スクリーンショット

（実装後にスクリーンショットを追加予定）

## 技術スタック

### フロントエンド
- React.js
- Redux または Context API
- D3.js または Chart.js（データ可視化）
- WebSocket（リアルタイム通信）

### バックエンド
- Node.js + Express
- WebSocket（Socket.io または ws）
- RxJS（リアクティブプログラミング）

### インフラストラクチャ
- Docker + Kubernetes または AWS
- CI/CD: GitHub Actions

## インストールと実行

### 前提条件
- Node.js 14.0以上
- npm 6.0以上
- ProjectX Gateway APIのアクセス権（ユーザー名とAPIキー）

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/tsugu7/inago-market.git
cd inago-market

# 依存パッケージのインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してAPIキーなどを設定

# 開発サーバーの起動
npm run dev
```

## 使用方法

1. アプリケーションを起動すると、デフォルトでNQ（E-mini NASDAQ-100先物）の出来高データが表示されます
2. 画面上部の選択リストから監視したい契約を選択できます
3. 選択した契約の出来高データがリアルタイムで棒グラフに表示されます
4. 画面下部では全ての対象契約の現在価格と出来高の概要を確認できます

## プロジェクト構造

```
inago-market/
├── public/              # 静的ファイル
├── src/                 # ソースコード
│   ├── components/      # Reactコンポーネント
│   ├── services/        # APIサービス
│   ├── store/           # 状態管理
│   ├── utils/           # ユーティリティ関数
│   └── App.js           # メインアプリケーション
├── server/              # バックエンドサーバー
│   ├── api/             # REST API
│   ├── websocket/       # WebSocketサーバー
│   └── services/        # バックエンドサービス
├── docs/                # ドキュメント
│   ├── basic-spec.md    # ProjectX Gateway API仕様
│   ├── target-spec.md   # イナゴフライヤー仕様
│   └── designdoc.md     # 設計ドキュメント
├── .env.example         # 環境変数サンプル
└── README.md            # プロジェクト概要
```

## 開発ロードマップ

### フェーズ1: 基本機能実装
- バックエンドの市場データAPI連携
- WebSocketサーバーの実装
- 基本的なUI実装
- 単一契約の出来高表示

### フェーズ2: 機能拡張
- 複数契約の同時監視
- 契約切り替え機能
- データの視覚化強化
- パフォーマンス最適化

### フェーズ3: 高度な機能
- ユーザー設定の保存
- アラート機能
- 追加の分析指標
- モバイル対応の強化

## 設計ドキュメント

詳細な設計情報は以下のドキュメントを参照してください：

- [ProjectX Gateway API仕様](basic-spec.md)
- [イナゴフライヤー仕様](target-spec.md)
- [アプリケーション設計書](designdoc.md)

## ライセンス

MIT

## 謝辞

本プロジェクトは以下のリソースを参考にしています：
- [ProjectX Gateway API](https://gateway.docs.projectx.com/)
- [イナゴフライヤー](https://inagoflyer.appspot.com/btcmac)
