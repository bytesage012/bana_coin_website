import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateChartData, LINKS } from '../constants';
import { ArrowUpRight, TrendingUp, BarChart3, Activity } from 'lucide-react';

const LiveChart: React.FC = () => {
  const [data, setData] = useState(generateChartData());
  const [currentPrice, setCurrentPrice] = useState(0.004269);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      const lastPrice = data[data.length - 1].price;
      const change = (Math.random() - 0.45) * 0.0001;
      const newPrice = Math.max(0.001, lastPrice + change);
      
      setCurrentPrice(newPrice);
      
      setData(prev => {
        const newData = [...prev.slice(1), { 
          time: `${parseInt(prev[prev.length - 1].time) + 1}m`, 
          price: newPrice,
          pv: Math.floor(Math.random() * 10000) 
        }];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [data]);

  return (
    <section id="chart" className="py-24 bg-bana-dark relative overflow-hidden">
      {/* Bg glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-bana-yellow/5 blur-[120px] rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="font-display text-5xl md:text-6xl text-white mb-2">
              LIVE <span className="text-bana-yellow">ACTION</span>
            </h2>
            <div className="flex items-center gap-4">
               <span className="text-3xl font-bold font-mono text-green-400">${currentPrice.toFixed(6)}</span>
               <span className="flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded text-sm font-bold">
                 <TrendingUp size={14} /> +24.5%
               </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {[
              { name: 'Raydium', url: LINKS.RAYDIUM },
              { name: 'Jupiter', url: LINKS.JUPITER },
              { name: 'DexScreener', url: LINKS.DEXSCREENER }
            ].map((ex) => (
               <a 
                key={ex.name}
                href={ex.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-bana-yellow/50 transition-all text-sm font-bold"
               >
                 {ex.name} <ArrowUpRight size={14} />
               </a>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase"><Activity size={14}/> 24h Volume</div>
                <div className="text-xl font-bold">$1,245,903</div>
            </div>
             <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase"><BarChart3 size={14}/> Market Cap</div>
                <div className="text-xl font-bold">$4,200,000</div>
            </div>
             <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase">Liquidity</div>
                <div className="text-xl font-bold">$285,000</div>
            </div>
             <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 text-gray-400 mb-1 text-xs uppercase">Holders</div>
                <div className="text-xl font-bold">2,420</div>
            </div>
        </div>

        {/* Chart */}
        <div className="w-full h-[500px] bg-black/40 border border-white/10 rounded-3xl p-4 md:p-8 backdrop-blur-sm">
           <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F3BA2F" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F3BA2F" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#666" tick={{fill: '#666'}} />
              <YAxis domain={['auto', 'auto']} stroke="#666" tick={{fill: '#666'}} width={60} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0B0E11', border: '1px solid #F3BA2F' }}
                itemStyle={{ color: '#F3BA2F' }}
                labelStyle={{ color: '#999' }}
                formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#F3BA2F" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorPrice)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

export default LiveChart;
