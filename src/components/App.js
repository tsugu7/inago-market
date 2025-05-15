import React, { useState, useEffect, useRef } from 'react';
import ContractSelector from './ContractSelector';
import VolumeChart from './VolumeChart';
import ContractGrid from './ContractGrid';
import { io } from 'socket.io-client';
import WebSocketClient from '../utils/websocketClient';

const App = () => {
  const [selectedContract, setSelectedContract] = useState('ES');
  const [contracts, setContracts] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isConnectedToExchange, setIsConnectedToExchange] = useState(false);
  const [error, setError] = useState(null);
  const wsClientRef = useRef(null);
  const [availableContracts, setAvailableContracts] = useState([
    { id: 'ES', name: 'E-mini S&P 500' },
    { id: 'MSE', name: 'Micro E-mini S&P 500' },
    { id: 'NQ', name: 'E-mini NASDAQ-100' },
    { id: 'MNQ', name: 'Micro E-mini NASDAQ-100' },
    { id: 'CL', name: '原油先物' },
    { id: 'MCL', name: 'Micro 原油先物' },
    { id: 'GC', name: '金先物' },
    { id: 'MGC', name: 'Micro 金先物' }
  ]);

  // 取引所WebSocketの初期化
  useEffect(() => {
    const initExchangeWebSocket = async () => {
      try {
        // WebSocketクライアントの初期化
        const wsClient = new WebSocketClient();
        wsClientRef.current = wsClient;
        
        // コールバック関数の設定
        wsClient.setCallbacks({
          onConnect: (type) => {
            console.log(`${type} WebSocketに接続しました`);
            setIsConnectedToExchange(true);
            setError(null);
            
            // 選択された契約を購読
            wsClient.subscribeToContract(selectedContract);
          },
          onDisconnect: (type) => {
            console.log(`${type} WebSocketから切断されました`);
            setIsConnectedToExchange(false);
          },
          onDepthData: (contractId, data) => {
            if (contractId === selectedContract) {
              // 板情報データから出来高データを生成
              processDepthData(contractId, data);
            }
          },
          onError: (errorMsg) => {
            console.error('WebSocketエラー:', errorMsg);
            setError(errorMsg);
          }
        });
        
        // WebSocketクライアントを初期化
        const initialized = await wsClient.init();
        if (initialized) {
          console.log('WebSocketクライアントの初期化に成功しました');
        } else {
          console.error('WebSocketクライアントの初期化に失敗しました');
          setError('WebSocketクライアントの初期化に失敗しました');
        }
      } catch (error) {
        console.error('WebSocket初期化エラー:', error);
        setError(`WebSocket初期化エラー: ${error.message}`);
      }
    };
    
    // 初期チャートデータの生成（ランダムな値を持つデータポイント）
    const now = Date.now();
    const initialVolumeData = Array(12).fill(0).map((_, i) => {
      const timestamp = now - (11 - i) * 5000;
      // ランダムな出来高（-100〜100の範囲）
      const randomVolume = Math.floor(Math.random() * 200) - 100;
      return {
        timestamp,
        volume: i === 11 ? randomVolume : Math.floor(Math.random() * 40) - 20 // 最新のデータポイントは大きめの値
      };
    });
    setVolumeData(initialVolumeData);
    console.log("Initial volume data:", initialVolumeData);

    // ローカルサーバーのWebSocket接続（モックデータ用）
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // 契約リストの受信
    newSocket.on('contracts', (data) => {
      setAvailableContracts(data);
    });

    // マーケットデータの受信
    newSocket.on('market_data', (data) => {
      setContracts(data);
      updateChartData(data);
    });

    // 取引所WebSocketの初期化
    initExchangeWebSocket();

    return () => {
      // ローカルサーバーのWebSocket切断
      if (newSocket) {
        newSocket.disconnect();
      }
      
      // 取引所WebSocketの切断
      if (wsClientRef.current) {
        wsClientRef.current.disconnect();
      }
    };
  }, []);
  
  // 板情報データの処理
  const processDepthData = (contractId, depthData) => {
    // 現在の時間を取得
    const now = Date.now();
    
    // 現在の時間を5秒単位に丸める（5秒ごとのタイムスロット）
    const timeSlot = Math.floor(now / 5000) * 5000;
    
    // 最後のデータポイントのタイムスロットを取得
    const lastTimeSlot = volumeData.length > 0 ? 
      Math.floor(volumeData[volumeData.length - 1].timestamp / 5000) * 5000 : 0;
    
    // 板情報データから出来高を計算
    // type 5: 買い注文、type 6: 売り注文
    const buyVolume = depthData
      .filter(item => item.type === 5 || item.type === 10)
      .reduce((sum, item) => sum + item.volume, 0);
    
    const sellVolume = depthData
      .filter(item => item.type === 6 || item.type === 9)
      .reduce((sum, item) => sum + item.volume, 0);
    
    // 買い注文と売り注文の差を出来高として使用
    const volume = buyVolume - sellVolume;
    
    // 新しいデータポイントを作成
    const newDataPoint = {
      timestamp: timeSlot,
      volume: volume
    };
    
    // 現在のデータ配列をコピー
    let newVolumeData = [...volumeData];
    
    if (timeSlot > lastTimeSlot) {
      // 新しいタイムスロットの場合、新しいデータポイントを追加
      newVolumeData.push(newDataPoint);
      // 最大30ポイントを維持
      if (newVolumeData.length > 30) {
        newVolumeData = newVolumeData.slice(-30);
      }
      
      // 更新されたデータを設定
      setVolumeData(newVolumeData);
      console.log("Updated volume data from depth:", newVolumeData);
    } else {
      // 同じタイムスロット内の場合、最後のデータポイントを更新
      newVolumeData[newVolumeData.length - 1] = newDataPoint;
      
      // 更新されたデータを設定
      setVolumeData(newVolumeData);
    }
  };

  // チャートデータの更新
  const updateChartData = (contractsData) => {
    const now = Date.now();
    const selectedContractData = contractsData.find(c => c.id === selectedContract);
    
    // 最新のデータを取得
    const latestVolume = selectedContractData ? selectedContractData.cumulativeVolume : 0;
    
    // 現在の時間を5秒単位に丸める（5秒ごとのタイムスロット）
    const timeSlot = Math.floor(now / 5000) * 5000;
    
    // 最後のデータポイントのタイムスロットを取得
    const lastTimeSlot = volumeData.length > 0 ? 
      Math.floor(volumeData[volumeData.length - 1].timestamp / 5000) * 5000 : 0;
    
    // 新しいデータポイントを作成
    const newDataPoint = {
      timestamp: timeSlot,
      volume: latestVolume
    };
    
    // 現在のデータ配列をコピー
    let newVolumeData = [...volumeData];
    
    if (volumeData.length === 0) {
      // データがない場合は初期データを生成
      newVolumeData = Array(12).fill(0).map((_, i) => {
        const timestamp = timeSlot - (11 - i) * 5000;
        return {
          timestamp,
          volume: i === 11 ? latestVolume : Math.floor(Math.random() * 40) - 20
        };
      });
    } else if (timeSlot > lastTimeSlot) {
      // 新しいタイムスロットの場合、新しいデータポイントを追加
      newVolumeData.push(newDataPoint);
      // 最大30ポイントを維持
      if (newVolumeData.length > 30) {
        newVolumeData = newVolumeData.slice(-30);
      }
    } else {
      // 同じタイムスロット内の場合、最後のデータポイントを更新
      newVolumeData[newVolumeData.length - 1] = newDataPoint;
    }
    
    console.log("Chart data:", newVolumeData);
    setVolumeData(newVolumeData);
  };

  // 契約選択の変更ハンドラ
  const handleContractChange = (contractId) => {
    // 以前の契約の購読を解除
    if (wsClientRef.current && selectedContract) {
      wsClientRef.current.unsubscribeFromContract(selectedContract);
    }
    
    // 新しい契約を設定
    setSelectedContract(contractId);
    
    // 新しい契約を購読
    if (wsClientRef.current) {
      wsClientRef.current.subscribeToContract(contractId);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>inago-market</h1>
      </header>
      
      <ContractSelector 
        contracts={availableContracts} 
        selectedContract={selectedContract} 
        onContractChange={handleContractChange} 
      />
      
      <VolumeChart 
        data={volumeData} 
        selectedContract={selectedContract} 
      />
      
      <ContractGrid 
        contracts={contracts} 
      />
    </div>
  );
};

export default App;
