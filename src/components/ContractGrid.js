import React, { useState, useEffect } from 'react';

const ContractGrid = ({ contracts }) => {
  // 出来高バーの最大値（200で塗りつぶし）
  const maxVolume = 200;
  
  // 前回の価格を保存するためのステート
  const [prevPrices, setPrevPrices] = useState({});
  
  // 価格変化の方向を保存するステート（1: 上昇, -1: 下降, 0: 変化なし）
  const [priceDirections, setPriceDirections] = useState({});
  
  // 契約データが変更されたときに価格の変化を検出
  useEffect(() => {
    const newPriceDirections = {};
    
    contracts.forEach(contract => {
      const prevPrice = prevPrices[contract.id] || contract.price;
      
      if (contract.price > prevPrice) {
        newPriceDirections[contract.id] = 1; // 上昇
      } else if (contract.price < prevPrice) {
        newPriceDirections[contract.id] = -1; // 下降
      } else {
        newPriceDirections[contract.id] = 0; // 変化なし
      }
    });
    
    // 価格方向を更新
    setPriceDirections(newPriceDirections);
    
    // 現在の価格を保存して次回の比較に使用
    const newPrevPrices = {};
    contracts.forEach(contract => {
      newPrevPrices[contract.id] = contract.price;
    });
    setPrevPrices(newPrevPrices);
  }, [contracts]);

  const formatPrice = (price) => {
    return price.toLocaleString('ja-JP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  
  // 価格の変化に基づいてクラス名を決定
  const getPriceClassName = (contractId) => {
    const direction = priceDirections[contractId];
    if (direction === 1) return "price price-up";
    if (direction === -1) return "price price-down";
    return "price";
  };

  return (
    <div className="contracts-grid">
      {contracts.map(contract => (
        <div key={contract.id} className="contract-card">
          <h3>{contract.id}<br />{contract.name}</h3>
          <div className={getPriceClassName(contract.id)}>
            {formatPrice(contract.price)}
          </div>
          
          <div className="volume-bar-container">
            <div className="volume-bar">
              <div 
                className={`volume-bar-fill ${contract.isPositive ? 'positive' : 'negative'}`}
                style={{ 
                  width: `${Math.min(Math.abs(contract.cumulativeVolume) / maxVolume * 100, 100)}%` 
                }}
              ></div>
            </div>
            
            <div className="volume-value">
              {contract.isPositive ? '+' : '-'}{Math.abs(contract.cumulativeVolume)} / 10秒
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContractGrid;
