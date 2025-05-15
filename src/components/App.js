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
    // 初期チャートデータの生成
    const initialVolumeData = Array(12).fill(0).map((_, i) => ({
      timestamp: Date.now() - (11 - i) * 5000,
      volume: 0
    }));
    setVolumeData(initialVolumeData);

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
    
    // 5秒ごとに新しいデータポイントを追加
    if (volumeData.length === 0 || now - volumeData[volumeData.length - 1].timestamp >= 5000) {
      const newVolumeData = [...(volumeData.length >= 12 ? volumeData.slice(1) : volumeData), {
        timestamp: now,
        volume: selectedContractData ? selectedContractData.cumulativeVolume : 0
      }];
      setVolumeData(newVolumeData);
    } else {
      // 最後のデータポイントを更新
      const newVolumeData = [...volumeData.slice(0, -1), {
        timestamp: volumeData[volumeData.length - 1].timestamp,
        volume: selectedContractData ? selectedContractData.cumulativeVolume : 0
      }];
      setVolumeData(newVolumeData);
    }
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
