import React, { useState, useEffect } from 'react';
import StatCard from './StatCard';
import StatsSection from './StatsSection';
import EquityChart from './EquityChart';

const API_URL = '/api/dashboard';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('API request failed');
      }
      const jsonData = await response.json();
      
      setData(jsonData);
      setError(null);
      
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setChartData(prevData => {
        // Only append if it's the first point or if equity actually changed, avoiding artificial flat lines
        // Wait, for a live chart, it's normal to append every tick. But to avoid visual spam, let's append anyway.
        const newDataPoint = {
          time: timeStr,
          equity: jsonData.equity,
          balance: jsonData.balance
        };
        const updatedData = [...prevData, newDataPoint];
        if (updatedData.length > 50) {
          updatedData.shift();
        }
        return updatedData;
      });

    } catch (err) {
      console.error(err);
      setError('Connection lost');
    } finally {
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0E11] p-4 font-sans text-[#EAECEF]">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header Minimalist */}
        <header className="mb-6 flex justify-between items-center border-b border-[#2B3139] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FCD535] rounded flex items-center justify-center">
              <span className="text-[#0B0E11] font-bold text-lg leading-none">T</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Trade Terminal</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {error && <div className="text-[#F6465D] text-sm bg-[#F6465D]/10 px-3 py-1 rounded border border-[#F6465D]/20">{error}</div>}
            <div className={`px-3 py-1 rounded text-sm font-medium border ${loading ? 'border-[#FCD535] text-[#FCD535]' : 'border-[#0ECB81] text-[#0ECB81]'}`}>
              {loading ? 'Connecting' : 'Connected API'}
            </div>
          </div>
        </header>

        {/* Top Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatCard 
            title="Total Balance" 
            value={data?.balance || 0} 
            isCurrency={true} 
            color="white"
            loading={loading}
          />
          <StatCard 
            title="Current Equity" 
            value={data?.equity || 0} 
            isCurrency={true} 
            color="white"
            loading={loading}
          />
          <StatCard 
            title="Daily Profit" 
            value={data?.profit_today || 0} 
            isCurrency={true} 
            color={data?.profit_today >= 0 ? 'green' : 'red'}
            prefix={data?.profit_today > 0 ? '+' : ''}
            loading={loading}
          />
        </div>

        {/* Middle and Bottom Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Middle Section: Stats */}
          <div className="lg:col-span-1">
            <StatsSection resultData={data} loading={loading} />
          </div>
          
          {/* Bottom Section: Chart */}
          <div className="lg:col-span-3">
            <EquityChart data={chartData} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
