import React from 'react';

const StatsSection = ({ resultData, loading }) => {
  const { win = 0, loss = 0, winrate = 0, positions = 0 } = resultData || {};

  return (
    <div className="bg-[#181A20] rounded-lg p-5 border border-[#2B3139] h-full flex flex-col">
      
      <div className="flex justify-between items-center border-b border-[#2B3139] pb-3 mb-4">
        <h3 className="text-[#EAECEF] font-semibold text-base">Overview Stats</h3>
        <div className="text-xs text-[#EAECEF] bg-[#2B3139] px-2 py-1 rounded">
          {loading ? '-' : `${positions} Positions`}
        </div>
      </div>

      <div className="flex flex-col gap-5 flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-[#848E9C] text-sm">Winning Trades</span>
          {loading ? (
            <div className="h-5 w-16 bg-[#2B3139] animate-pulse rounded"></div>
          ) : (
            <span className="text-[#0ECB81] font-mono font-medium text-lg">
              {Number(win || 0).toLocaleString('en-US')}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#848E9C] text-sm">Losing Trades</span>
          {loading ? (
            <div className="h-5 w-16 bg-[#2B3139] animate-pulse rounded"></div>
          ) : (
            <span className="text-[#F6465D] font-mono font-medium text-lg">
              {Number(loss || 0).toLocaleString('en-US')}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#848E9C] text-sm">Win Rate</span>
          {loading ? (
            <div className="h-5 w-16 bg-[#2B3139] animate-pulse rounded"></div>
          ) : (
            <div className="flex font-mono font-medium text-lg text-[#FCD535]">
              {Number(winrate || 0).toFixed(2)}%
            </div>
          )}
        </div>

        {/* Minimal Progress Bar without animations */}
        <div className="mt-auto pt-4 border-t border-[#2B3139]">
          <div className="flex justify-between text-xs text-[#848E9C] mb-2 font-mono">
            <span className="text-[#0ECB81]">Win</span>
            <span className="text-[#F6465D]">Loss</span>
          </div>
          <div className="w-full bg-[#2B3139] h-2 flex overflow-hidden">
            <div 
              className="bg-[#0ECB81]"
              style={{ width: `${loading ? 50 : winrate}%` }}
            ></div>
            <div 
              className="bg-[#F6465D]"
              style={{ width: `${loading ? 50 : 100 - winrate}%` }}
            ></div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default StatsSection;
