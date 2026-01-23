import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TOKENOMICS_DATA, LINKS } from '../constants';
import { motion } from 'framer-motion';
import { ExternalLink, Copy, Check } from 'lucide-react';

const Tokenomics: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(LINKS.CONTRACT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="tokenomics" className="py-24 bg-gradient-to-b from-bana-dark to-black">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-5xl md:text-7xl text-center text-white mb-8">
          TOKEN<span className="text-bana-yellow">OMICS</span>
        </h2>
        
        <p className="text-center text-gray-400 max-w-2xl mx-auto mb-16">
          The $BANA economy is designed for longevity and community rewards. 
          With 90% of the supply sent directly to the liquidity pool and burned, 
          the floor is set. The remaining tokens are vested for strategic partnerships to propel us to the moon.
        </p>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Chart */}
          <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="h-[400px] w-full relative"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={TOKENOMICS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={160}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {TOKENOMICS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0E11', border: '1px solid #F3BA2F', borderRadius: '10px' }}
                  itemStyle={{ color: '#F3BA2F' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-gray-400 text-sm">Total Supply</span>
              <span className="text-3xl font-bold text-white">1 Billion</span>
            </div>
          </motion.div>

          {/* Legend */}
          <div className="space-y-6">
            {TOKENOMICS_DATA.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-6 bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-bana-yellow/30 transition-all"
              >
                <div 
                  className="w-4 h-full min-h-[40px] rounded-full" 
                  style={{ backgroundColor: item.fill }}
                />
                <div>
                  <h3 className="text-2xl font-bold text-white">{item.value}%</h3>
                  <p className="text-gray-400 uppercase tracking-wide">{item.name}</p>
                </div>
              </motion.div>
            ))}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-8 p-6 border border-bana-yellow/20 rounded-2xl bg-bana-yellow/5 hover:bg-bana-yellow/10 transition-colors"
            >
              <h4 className="text-bana-yellow font-bold mb-2 flex items-center justify-between">
                Contract Address (Solana)
                <span className="text-xs bg-bana-yellow text-bana-dark px-2 py-1 rounded">Verfied</span>
              </h4>
              <div className="flex gap-2">
                 <button
                  onClick={handleCopy}
                  className="group flex items-center justify-between gap-4 w-full text-left relative"
                >
                  <code className="block flex-1 break-all text-sm text-gray-300 font-mono bg-black/50 p-3 rounded-lg border border-white/10 group-hover:border-bana-yellow/50 transition-colors">
                    {LINKS.CONTRACT}
                  </code>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-bana-yellow">
                    {copied ? <Check size={20} /> : <Copy size={20} className="opacity-50 group-hover:opacity-100" />}
                  </div>
                </button>
                 <a 
                  href={LINKS.SOLSCAN} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-black/50 border border-white/10 rounded-lg hover:border-bana-yellow/50 hover:text-bana-yellow transition-colors flex items-center"
                  title="View on Solscan"
                >
                  <ExternalLink size={20} />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tokenomics;