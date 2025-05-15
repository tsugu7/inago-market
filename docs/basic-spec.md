# ProjectX Gateway API 基本仕様書

## 目次

1. [概要](#概要)
2. [ProjectX Gateway API](#projectx-gateway-api)
   - [認証](#認証)
   - [API エンドポイント](#api-エンドポイント)
   - [主要機能](#主要機能)
3. [リアルタイムオーダーブックアプリケーション](#リアルタイムオーダーブックアプリケーション)
   - [機能概要](#機能概要)
   - [アーキテクチャ](#アーキテクチャ)
   - [実装言語](#実装言語)
   - [主要コンポーネント](#主要コンポーネント)
4. [技術仕様](#技術仕様)
   - [WebSocket通信](#websocket通信)
   - [オーダーブック処理](#オーダーブック処理)
   - [環境設定](#環境設定)

## 概要

本ドキュメントは、ProjectX Gateway APIとそのAPIを利用したリアルタイムオーダーブック処理アプリケーションの基本仕様を説明します。ProjectX Gateway APIは、プロップファームと評価プロバイダー向けのトレーディングプラットフォームであり、アカウント管理、マーケットデータ取得、注文処理、ポジション管理などの機能を提供します。リアルタイムオーダーブックアプリケーションは、このAPIを利用して市場の注文情報をリアルタイムで取得・表示するサンプル実装です。

## ProjectX Gateway API

ProjectX Gateway APIは、REST APIアーキテクチャを採用し、プロップファームトレーダー操作を管理するための包括的なインターフェースを提供します。

### 認証

APIへのアクセスには、JSON Web Token（JWT）を使用した認証が必要です。認証方法は以下の2種類があります：

1. **APIキーによる認証**
   - ユーザー名とAPIキーを使用
   - エンドポイント: `/api/Auth/loginKey`
   - 認証成功後、24時間有効なセッショントークンが発行される

2. **承認されたアプリケーションによる認証**
   - ユーザー名、パスワード、deviceId、appId、verifyKeyを使用
   - エンドポイント: `/api/Auth/loginApp`
   - 認証成功後、24時間有効なセッショントークンが発行される

認証後のリクエストでは、`Authorization`ヘッダーに`Bearer`メソッドを使用してトークンを提供する必要があります。

### API エンドポイント

ProjectX Gateway APIは、以下の主要なエンドポイントを提供します：

1. **アカウント関連**
   - `/api/Account/search`: アカウント検索

2. **マーケットデータ関連**
   - `/api/History/retrieveBars`: 履歴バーデータの取得
   - `/api/Contract/search`: 契約検索
   - `/api/Contract/searchById`: IDによる契約検索

3. **注文関連**
   - `/api/Order/search`: 注文検索
   - `/api/Order/searchOpen`: 未執行注文検索
   - `/api/Order/place`: 注文発注
   - `/api/Order/cancel`: 注文キャンセル
   - `/api/Order/modify`: 注文変更

4. **ポジション関連**
   - `/api/Position/closeContract`: ポジションクローズ
   - `/api/Position/partialCloseContract`: ポジション部分クローズ
   - `/api/Position/searchOpen`: 未決済ポジション検索

5. **取引関連**
   - `/api/Trade/search`: 取引検索

### 主要機能

1. **アカウント管理**
   - アカウント情報の取得
   - アカウントステータスの確認

2. **マーケットデータ**
   - 契約情報の検索
   - 価格履歴データの取得（秒、分、時間、日、週、月単位）

3. **注文管理**
   - 様々な注文タイプのサポート（指値、成行、逆指値、トレーリングストップなど）
   - 注文の発注、変更、キャンセル
   - 注文履歴の検索

4. **ポジション管理**
   - ポジションのクローズ（全部または一部）
   - 未決済ポジションの検索

5. **リアルタイム更新**
   - SignalR（WebSocket）を使用したリアルタイムデータの提供
   - ユーザーハブ（アカウント、注文、ポジション更新）
   - マーケットハブ（市場取引イベント、DOM（Depth of Market）イベント）

## リアルタイムオーダーブックアプリケーション

リアルタイムオーダーブックアプリケーションは、ProjectX Gateway APIを使用して、リアルタイムの注文情報（オーダーブック）を取得・表示するサンプル実装です。

### 機能概要

1. **認証機能**
   - ProjectX Gateway APIへの認証
   - セッショントークンの管理

2. **リアルタイムデータ取得**
   - WebSocketを使用したリアルタイムマーケットデータの受信
   - 注文情報（オーダーブック）の取得

3. **データ表示**
   - オーダーブック情報のコンソール表示
   - リアルタイム更新

4. **設定管理**
   - 環境変数による設定
   - コマンドライン引数によるカスタマイズ

### アーキテクチャ

アプリケーションは、以下のコンポーネントで構成されています：

1. **APIクライアント**
   - ProjectX Gateway APIとの通信を担当
   - 認証処理
   - RESTリクエストの送信

2. **WebSocketクライアント**
   - SignalRプロトコルを使用したWebSocket通信
   - リアルタイムデータの受信
   - イベントハンドリング

3. **オーダーブック処理**
   - 受信したデータの解析
   - オーダーブックの構築と更新
   - データの整形と表示

4. **設定管理**
   - 環境変数の読み込み
   - コマンドライン引数の解析
   - デフォルト設定の提供

### 実装言語

アプリケーションは、以下の言語で実装されています：

1. **Python実装**
   - Python 3.7以上が必要
   - 主要な依存関係：
     - `requests`: HTTP通信
     - `websockets`: WebSocket通信
     - `python-dotenv`: 環境変数管理
     - `argparse`: コマンドライン引数解析

2. **JavaScript実装**
   - Node.js 14.0以上が必要
   - 主要な依存関係：
     - `@microsoft/signalr`: SignalR通信
     - `axios`: HTTP通信
     - `dotenv`: 環境変数管理
     - `yargs`: コマンドライン引数解析

### 主要コンポーネント

#### Python実装

- `main.py`: メインアプリケーションファイル
- `api_client.py`: ProjectX Gateway APIとの通信を担当するクラス
- `orderbook.py`: 注文情報（オーダーブック）を処理するクラス
- `websocket_client.py`: WebSocketクライアントクラス
- `config.py`: 設定ファイル

#### JavaScript実装

- `main.js`: メインアプリケーションファイル
- `api_client.js`: ProjectX Gateway APIとの通信を担当するクラス
- `orderbook.js`: 注文情報（オーダーブック）を処理するクラス
- `websocket_client.js`: WebSocketクライアントクラス
- `config.js`: 設定ファイル

## 技術仕様

### WebSocket通信

リアルタイムデータの取得には、SignalRプロトコルを使用したWebSocket通信が使用されています。

1. **接続プロセス**
   - 認証トークンの取得
   - WebSocket接続の確立
   - プロトコルハンドシェイク
   - サブスクリプションの設定

2. **ハブ**
   - **ユーザーハブ**: アカウント、注文、ポジション更新
     - エンドポイント: `wss://rtc.topstepx.com/hubs/user`
     - 主要メソッド: `SubscribeAccounts`, `SubscribeOrders`, `SubscribePositions`, `SubscribeTrades`
   
   - **マーケットハブ**: 市場データ、DOM（Depth of Market）イベント
     - エンドポイント: `wss://rtc.topstepx.com/hubs/market`
     - 主要メソッド: `SubscribeContractQuotes`, `SubscribeContractTrades`, `SubscribeContractMarketDepth`

3. **イベント**
   - `GatewayQuote`: 価格更新
   - `GatewayTrade`: 取引更新
   - `GatewayDepth`: 深度更新
   - `GatewayUserAccount`: アカウント更新
   - `GatewayUserOrder`: 注文更新
   - `GatewayUserPosition`: ポジション更新
   - `GatewayUserTrade`: ユーザー取引更新

### オーダーブック処理

オーダーブックは、市場の買い注文（ビッド）と売り注文（アスク）の集合体です。

1. **データ構造**
   - ビッド（買い注文）: 価格の降順でソート
   - アスク（売り注文）: 価格の昇順でソート
   - 各価格レベルでの注文量

2. **更新タイプ**
   - タイプ1: ビッド（買い注文）の追加/更新
   - タイプ2: アスク（売り注文）の追加/更新
   - タイプ5: 取引発生
   - タイプ9: ビッド（買い注文）の削除
   - タイプ10: アスク（売り注文）の削除

3. **表示形式**
   - 価格レベルごとの注文量
   - リアルタイム更新
   - コンソール出力

### 環境設定

アプリケーションの設定は、環境変数とコマンドライン引数を通じて行われます。

1. **環境変数**
   - `PROJECTX_USERNAME`: ProjectX Gateway APIのユーザー名
   - `PROJECTX_API_KEY`: ProjectX Gateway APIのAPIキー
   - `PROJECTX_API_URL`: API URL（オプション）
   - `PROJECTX_MARKET_HUB_URL`: マーケットハブURL（オプション）
   - `PROJECTX_USER_HUB_URL`: ユーザーハブURL（オプション）
   - `DEFAULT_CONTRACT_ID`: デフォルトの契約ID
   - `DEFAULT_ACCOUNT_ID`: デフォルトのアカウントID
   - `UPDATE_INTERVAL`: 更新間隔（ミリ秒）
   - `LOG_LEVEL`: ログレベル
   - `LOG_FILE`: ログファイル名

2. **コマンドライン引数**
   - `--contract`, `-c`: 契約ID
   - `--account`, `-a`: アカウントID
   - `--log-level`, `-l`: ログレベル
   - `--update-interval`, `-i`: 更新間隔（ミリ秒）

3. **設定ファイル**
   - `.env`: 環境変数設定ファイル
   - `.env.example`: 環境変数設定ファイルのサンプル
