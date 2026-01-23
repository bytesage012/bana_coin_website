import React from 'react';
import { STATS } from '../constants';

const Stats: React.FC = () => {
  return (
    <div className="w-full bg-black/50 border-y border-white/5 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, index) => (
            <div key={index} className="text-center group cursor-default">
              <p className="text-gray-500 text-sm uppercase tracking-wider mb-1 group-hover:text-bana-yellow transition-colors">{stat.label}</p>
              <h3 className="text-2xl md:text-4xl font-display text-white">{stat.value}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Stats;
