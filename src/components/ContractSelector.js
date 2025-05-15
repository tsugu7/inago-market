import React from 'react';

const ContractSelector = ({ contracts, selectedContract, onContractChange }) => {
  const handleChange = (e) => {
    onContractChange(e.target.value);
  };

  return (
    <div className="contract-selector">
      <select value={selectedContract} onChange={handleChange}>
        {contracts.map(contract => (
          <option key={contract.id} value={contract.id}>
            {contract.name} ({contract.id})
          </option>
        ))}
      </select>
    </div>
  );
};

export default ContractSelector;
