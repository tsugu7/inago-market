import React from 'react';

const ContractGrid = ({ contracts }) => {
  // 出来高バーの最大値（200で塗りつぶし）
  const maxVolume = 200;

  const formatPrice = (price) => {
    return price.toLocaleString('ja-JP', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="contracts-grid">
      {contracts.map(contract => (
        <div key={contract.id} className="contract-card">
          <h3>{contract.name} ({contract.id})</h3>
          <div className="price">{formatPrice(contract.price)}</div>
          
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
      ))}
    </div>
  );
};

export default ContractGrid;
