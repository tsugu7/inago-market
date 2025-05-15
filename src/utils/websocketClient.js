import io from 'socket.io-client';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.marketSocket = null;
    this.callbacks = {
      onConnect: () => {},
      onDisconnect: () => {},
      onMarketData: () => {},
      onDepthData: () => {},
      onError: () => {}
    };
    this.contractSubscriptions = new Set();
  }

  // 認証情報を取得
  getAuthInfo() {
    return {
      username: process.env.REACT_APP_PROJECTX_USERNAME,
      apiKey: process.env.REACT_APP_PROJECTX_API_KEY,
      marketHubUrl: process.env.REACT_APP_PROJECTX_MARKET_HUB_URL || 'wss://rtc.topstepx.com/hubs/market',
      userHubUrl: process.env.REACT_APP_PROJECTX_USER_HUB_URL || 'wss://rtc.topstepx.com/hubs/user',
      apiUrl: process.env.REACT_APP_PROJECTX_API_URL || 'https://api.topstepx.com'
    };
  }

  // APIに認証してトークンを取得
  async authenticate() {
    const { username, apiKey, apiUrl } = this.getAuthInfo();
    
    try {
      const response = await fetch(`${apiUrl}/api/Auth/loginKey`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/plain'
        },
        body: JSON.stringify({
          userName: username,
          apiKey: apiKey
        })
      });
      
      const data = await response.json();
      
      if (data.success && data.errorCode === 0) {
        console.log('認証成功');
        return data.token;
      } else {
        console.error('認証エラー:', data.errorMessage);
        this.callbacks.onError(`認証エラー: ${data.errorMessage}`);
        return null;
      }
    } catch (error) {
      console.error('認証リクエスト中にエラーが発生しました:', error);
      this.callbacks.onError(`認証エラー: ${error.message}`);
      return null;
    }
  }

  // マーケットデータのWebSocket接続を初期化
  async initMarketSocket(token) {
    const { marketHubUrl } = this.getAuthInfo();
    const url = `${marketHubUrl}?access_token=${token}`;
    
    try {
      // Socket.IOクライアントを初期化
      this.marketSocket = io(url, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });
      
      // 接続イベント
      this.marketSocket.on('connect', () => {
        console.log('マーケットデータWebSocketに接続しました');
        this.callbacks.onConnect('market');
        
        // 既存の購読を再購読
        this.contractSubscriptions.forEach(contractId => {
          this.subscribeToContract(contractId);
        });
      });
      
      // 切断イベント
      this.marketSocket.on('disconnect', () => {
        console.log('マーケットデータWebSocketから切断されました');
        this.callbacks.onDisconnect('market');
      });
      
      // エラーイベント
      this.marketSocket.on('error', (error) => {
        console.error('マーケットデータWebSocketエラー:', error);
        this.callbacks.onError(`マーケットデータエラー: ${error}`);
      });
      
      // マーケットデータイベント
      this.marketSocket.on('GatewayQuote', (contractId, data) => {
        // 相場データ
        console.log(`相場データ受信: ${contractId}`, data);
      });
      
      this.marketSocket.on('GatewayTrade', (contractId, data) => {
        // 取引データ
        console.log(`取引データ受信: ${contractId}`, data);
      });
      
      this.marketSocket.on('GatewayDepth', (contractId, data) => {
        // 板情報データ
        console.log(`板情報データ受信: ${contractId}`, data);
        this.callbacks.onDepthData(contractId, data);
      });
      
      return true;
    } catch (error) {
      console.error('マーケットデータWebSocket初期化エラー:', error);
      this.callbacks.onError(`マーケットデータWebSocket初期化エラー: ${error.message}`);
      return false;
    }
  }

  // 契約データを購読
  subscribeToContract(contractId) {
    if (!this.marketSocket) {
      console.error('マーケットデータWebSocketが初期化されていません');
      return false;
    }
    
    try {
      // 相場データを購読
      this.marketSocket.emit('SubscribeContractQuotes', contractId);
      
      // 取引データを購読
      this.marketSocket.emit('SubscribeContractTrades', contractId);
      
      // 板情報データを購読
      this.marketSocket.emit('SubscribeContractMarketDepth', contractId);
      
      // 購読リストに追加
      this.contractSubscriptions.add(contractId);
      
      console.log(`契約 ${contractId} を購読しました`);
      return true;
    } catch (error) {
      console.error(`契約 ${contractId} の購読中にエラーが発生しました:`, error);
      this.callbacks.onError(`契約購読エラー: ${error.message}`);
      return false;
    }
  }

  // 契約データの購読を解除
  unsubscribeFromContract(contractId) {
    if (!this.marketSocket) {
      console.error('マーケットデータWebSocketが初期化されていません');
      return false;
    }
    
    try {
      // 相場データの購読を解除
      this.marketSocket.emit('UnsubscribeContractQuotes', contractId);
      
      // 取引データの購読を解除
      this.marketSocket.emit('UnsubscribeContractTrades', contractId);
      
      // 板情報データの購読を解除
      this.marketSocket.emit('UnsubscribeContractMarketDepth', contractId);
      
      // 購読リストから削除
      this.contractSubscriptions.delete(contractId);
      
      console.log(`契約 ${contractId} の購読を解除しました`);
      return true;
    } catch (error) {
      console.error(`契約 ${contractId} の購読解除中にエラーが発生しました:`, error);
      this.callbacks.onError(`契約購読解除エラー: ${error.message}`);
      return false;
    }
  }

  // コールバック関数を設定
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // 接続を閉じる
  disconnect() {
    if (this.marketSocket) {
      this.marketSocket.disconnect();
      this.marketSocket = null;
    }
    
    this.contractSubscriptions.clear();
    console.log('WebSocket接続を閉じました');
  }

  // WebSocketクライアントを初期化
  async init() {
    // 認証してトークンを取得
    const token = await this.authenticate();
    if (!token) {
      return false;
    }
    
    // マーケットデータWebSocketを初期化
    const marketSocketInitialized = await this.initMarketSocket(token);
    
    return marketSocketInitialized;
  }
}

export default WebSocketClient;
