import React from 'react';

const StatCard = ({ title, value, isCurrency = false, color = 'white', loading = false, prefix = '' }) => {
  const isPositive = color === 'green';
  const isNegative = color === 'red';
  
  // Binance colors
  const valueColorClass = isPositive 
    ? 'text-[#0ECB81]' 
    : isNegative 
      ? 'text-[#F6465D]' 
      : 'text-[#EAECEF]';

  return (
    <div className="bg-[#181A20] rounded-lg p-5 border border-[#2B3139] flex flex-col justify-center transition-colors">
      <h3 className="text-[#848E9C] text-sm font-medium mb-1">
        {title}
      </h3>
      <div className="flex items-center mt-1">
        {loading ? (
          <div className="h-8 w-24 bg-[#2B3139] animate-pulse rounded"></div>
        ) : (
          <div className={`text-2xl font-semibold font-mono ${valueColorClass}`}>
            {prefix}
            {isCurrency ? '$' : ''}
            {Number(value || 0).toLocaleString('en-US', {
              minimumFractionDigits: isCurrency ? 2 : 2,
              maximumFractionDigits: isCurrency ? 2 : 2
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
