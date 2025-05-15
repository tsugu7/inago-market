import React, { useState, useEffect } from 'react';
import ContractSelector from './ContractSelector';
import VolumeChart from './VolumeChart';
import ContractGrid from './ContractGrid';
import { io } from 'socket.io-client';

const App = () => {
  const [selectedContract, setSelectedContract] = useState('NQ');
  const [contracts, setContracts] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [socket, setSocket] = useState(null);
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

  // WebSocketの初期化
  useEffect(() => {
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

    // WebSocket接続
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

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

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
    setSelectedContract(contractId);
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
