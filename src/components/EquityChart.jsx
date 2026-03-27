import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#181A20] border border-[#2B3139] p-3 shadow-lg">
        <p className="text-[#848E9C] text-xs font-mono mb-1">{label}</p>
        <p className="text-[#EAECEF] font-mono text-sm">
          Equity: ${parseFloat(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const EquityChart = ({ data }) => {
  return (
    <div className="bg-[#181A20] rounded-lg p-5 border border-[#2B3139] w-full h-[400px]">
      
      <div className="flex justify-between items-center border-b border-[#2B3139] pb-3 mb-4">
        <h3 className="text-[#EAECEF] font-semibold text-base">Live Equity Curve</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0ECB81]"></div>
          <span className="text-xs text-[#0ECB81] uppercase tracking-wider font-semibold">Real-time</span>
        </div>
      </div>
      
      <div className="h-[300px] w-full">
        {data.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#848E9C]">
            <span className="text-sm">Waiting for live tick...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#848E9C" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#2B3139' }}
                dy={10}
              />
              <YAxis 
                stroke="#848E9C" 
                fontSize={11} 
                tickLine={false}
                axisLine={{ stroke: '#2B3139' }}
                tickFormatter={(value) => `$${value}`}
                domain={['auto', 'auto']}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#474D57', strokeWidth: 1 }} />
              <Line 
                type="stepAfter" 
                dataKey="equity" 
                stroke="#FCD535" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#FCD535', stroke: '#181A20', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default EquityChart;
