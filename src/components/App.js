import React, { useState, useEffect, useRef } from 'react';
import ContractSelector from './ContractSelector';
import VolumeChart from './VolumeChart';
import ContractGrid from './ContractGrid';
import WebSocketClient from '../utils/websocketClient';

const App = () => {
  const [selectedContract, setSelectedContract] = useState('ES');
  const [contracts, setContracts] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
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
          onQuoteData: (contractId, data) => {
            // 相場データを処理
            processQuoteData(contractId, data);
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
    
    // 初期チャートデータの生成（空のデータポイント）
    const now = Date.now();
    const initialVolumeData = Array(12).fill(0).map((_, i) => {
      const timestamp = now - (11 - i) * 5000;
      return {
        timestamp,
        volume: 0 // 初期値は0
      };
    });
    setVolumeData(initialVolumeData);
    console.log("Initial volume data:", initialVolumeData);

    // 取引所WebSocketの初期化
    initExchangeWebSocket();

    return () => {
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


  // 相場データの処理
  const processQuoteData = (contractId, quoteData) => {
    // 現在の契約リストをコピー
    const updatedContracts = [...contracts];
    
    // 契約IDに一致する契約を検索
    const contractIndex = updatedContracts.findIndex(c => c.id === contractId);
    
    // 相場データから必要な情報を抽出
    const price = quoteData.price || 0;
    const cumulativeVolume = quoteData.volume || 0;
    const isPositive = cumulativeVolume >= 0;
    
    // 契約名を取得
    const contractInfo = availableContracts.find(c => c.id === contractId);
    const name = contractInfo ? contractInfo.name : '';
    
    if (contractIndex >= 0) {
      // 既存の契約を更新
      updatedContracts[contractIndex] = {
        ...updatedContracts[contractIndex],
        price,
        cumulativeVolume,
        isPositive
      };
    } else {
      // 新しい契約を追加
      updatedContracts.push({
        id: contractId,
        name,
        price,
        cumulativeVolume,
        isPositive
      });
    }
    
    // 更新された契約リストを設定
    setContracts(updatedContracts);
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
