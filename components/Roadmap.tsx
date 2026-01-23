import React from 'react';
import { ROADMAP } from '../constants';
import { CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';

const Roadmap: React.FC = () => {
  return (
    <section id="roadmap" className="py-24 relative">
       {/* Background Splatters */}
       <div className="absolute left-0 top-1/2 w-64 h-64 bg-bana-yellow/10 blur-[80px] rounded-full" />

      <div className="container mx-auto px-4">
        <h2 className="font-display text-5xl md:text-7xl text-center text-white mb-20">
          ROAD<span className="text-bana-yellow">MAP</span>
        </h2>

        <div className="max-w-4xl mx-auto space-y-12">
          {ROADMAP.map((phase, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className={`relative pl-8 md:pl-0 border-l-2 md:border-none border-bana-yellow/30 ${
                index % 2 === 0 ? 'md:text-right' : 'md:text-left'
              }`}
            >
              {/* Central Line for Desktop */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-bana-yellow to-transparent -translate-x-1/2" />
              
              {/* Dot */}
              <div className="absolute -left-[9px] md:left-1/2 md:-translate-x-1/2 top-0 w-4 h-4 rounded-full bg-bana-yellow shadow-[0_0_10px_#F3BA2F]" />

              <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:mr-auto' : 'md:pl-12 md:ml-auto'}`}>
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-all">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-4 ${
                    phase.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    phase.status === 'active' ? 'bg-bana-yellow/20 text-bana-yellow' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {phase.status}
                  </span>
                  
                  <h3 className="text-3xl font-display text-white mb-2">{phase.title}</h3>
                  <p className="text-gray-400 mb-6">{phase.description}</p>
                  
                  <ul className={`space-y-3 ${index % 2 === 0 ? 'md:flex md:flex-col md:items-end' : ''}`}>
                    {phase.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-300">
                        {index % 2 === 0 ? (
                          <>
                            <span className="hidden md:block">{item}</span>
                            <CheckCircle2 size={16} className="text-bana-yellow" />
                            <span className="md:hidden">{item}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={16} className="text-bana-yellow" />
                            {item}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roadmap;
