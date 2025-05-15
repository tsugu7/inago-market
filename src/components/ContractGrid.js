import React, { useState, useEffect, useRef } from 'react';

const ContractGrid = ({ contracts }) => {
  // 出来高バーの最大値（200で塗りつぶし）
  const maxVolume = 200;
  
  // 前回の価格を保存するためのステート
  const [prevPrices, setPrevPrices] = useState({});
  
  // 価格変化の方向を保存するステート（1: 上昇, -1: 下降, 0: 変化なし）
  const [priceDirections, setPriceDirections] = useState({});
  
  // 初回レンダリングフラグ
  const isFirstRender = useRef(true);
  
  // 契約データが変更されたときに価格の変化を検出
  useEffect(() => {
    // 初回レンダリング時は方向を設定しない（すべて白表示）
    if (isFirstRender.current) {
      const initialPrices = {};
      contracts.forEach(contract => {
        initialPrices[contract.id] = contract.price;
      });
      setPrevPrices(initialPrices);
      isFirstRender.current = false;
      return;
    }
    
    const newPriceDirections = {};
    
    contracts.forEach(contract => {
      const prevPrice = prevPrices[contract.id];
      
      // 前回の価格が存在する場合のみ比較
      if (prevPrice !== undefined) {
        if (contract.price > prevPrice) {
          newPriceDirections[contract.id] = 1; // 上昇
        } else if (contract.price < prevPrice) {
          newPriceDirections[contract.id] = -1; // 下降
        } else {
          newPriceDirections[contract.id] = 0; // 変化なし
        }
      } else {
        newPriceDirections[contract.id] = 0; // 初期値は変化なし
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
    return "price"; // 変化なしまたは初期状態
  };

  return (
    <div className="contracts-grid">
      {contracts.map(contract => (
        <div key={contract.id} className="contract-card">
          <div className="contract-header">
            <div className="contract-id">{contract.id}</div>
          </div>
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
