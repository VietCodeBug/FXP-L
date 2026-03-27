import React, { useState, useEffect, useCallback } from 'react';
import StatCard from './StatCard';
import StatsSection from './StatsSection';
import EquityChart from './EquityChart';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState([]);
  
  // API URL State
  const [apiUrl, setApiUrl] = useState(() => {
    return localStorage.getItem('trading_api_url') || 'http://35.239.159.234:8000/dashboard';
  });
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState(apiUrl);

  const handleSaveUrl = (e) => {
    e.preventDefault();
    if (tempUrl.trim()) {
      setApiUrl(tempUrl.trim());
      localStorage.setItem('trading_api_url', tempUrl.trim());
      setIsEditingUrl(false);
      setChartData([]); // Reset chart data when changing URL
      setLoading(true);
      setData(null);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const jsonData = await response.json();
      
      setData(jsonData);
      setError(null);
      
      const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      setChartData(prevData => {
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
      setError(err.message === 'Failed to fetch' ? 'Connection Error / CORS / Mixed Content' : 'Connection lost');
    } finally {
      if (loading) setLoading(false); // only toggle once initially
    }
  }, [apiUrl]); // Recreate if apiUrl changes

  useEffect(() => {
    setLoading(true); // Reset loading when URL changes
    fetchData();
    const intervalId = setInterval(fetchData, 3000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0B0E11] p-4 font-sans text-[#EAECEF]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Minimalist */}
        <header className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2B3139] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FCD535] rounded flex items-center justify-center">
              <span className="text-[#0B0E11] font-bold text-lg leading-none">T</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Trade Terminal</h1>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            {/* Connection Status Row */}
            <div className="flex items-center gap-4">
              {error && <div className="text-[#F6465D] text-xs bg-[#F6465D]/10 px-2 py-1 rounded border border-[#F6465D]/20 truncate max-w-[200px]">{error}</div>}
              <div className={`px-2 py-1 rounded text-xs font-medium border ${loading ? 'border-[#FCD535] text-[#FCD535]' : (error ? 'border-[#F6465D] text-[#F6465D]' : 'border-[#0ECB81] text-[#0ECB81]')}`}>
                {loading ? 'Connecting...' : (error ? 'Disconnected' : 'Connected API')}
              </div>
            </div>

            {/* API URL Config Row */}
            <div className="w-full relative">
              {isEditingUrl ? (
                <form onSubmit={handleSaveUrl} className="flex flex-col sm:flex-row gap-2 w-full sm:w-[450px]">
                  <input 
                    type="text" 
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    className="flex-grow bg-[#181A20] border border-[#2B3139] text-[#EAECEF] text-xs px-3 py-1.5 rounded focus:outline-none focus:border-[#FCD535] transition-colors"
                    placeholder="Enter Custom API URL..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setIsEditingUrl(false)} className="px-3 py-1.5 bg-[#2B3139] hover:bg-[#474D57] text-white text-xs rounded transition-colors">Cancel</button>
                    <button type="submit" className="px-3 py-1.5 bg-[#FCD535] hover:bg-[#F0B90B] text-[#0B0E11] font-semibold text-xs rounded transition-colors">Apply</button>
                  </div>
                </form>
              ) : (
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#181A20] border border-[#2B3139] rounded cursor-pointer hover:border-[#474D57] transition-colors group w-full sm:w-auto overflow-hidden"
                  onClick={() => setIsEditingUrl(true)}
                  title="Click to edit API endpoint"
                >
                  <span className="text-[#848E9C] text-xs shrink-0 font-mono">ENDPOINT:</span>
                  <span className="text-[#EAECEF] text-xs truncate max-w-[300px] font-mono">{apiUrl}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-[#848E9C] group-hover:text-[#FCD535] ml-auto shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              )}
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
