import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ShieldCheck, Gem } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="font-display text-5xl md:text-7xl mb-6 text-white">
            WHAT IS <span className="text-bana-yellow">$BANA</span>?
          </h2>
          <p className="text-xl text-gray-300">
            Inspired by the legacy of BNB but unleashed on the high-speed Solana chain. 
            $BANA isn't just a meme; it's a lifestyle. It represents the yellow energy 
            of success, speed, and community.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap size={40} />,
              title: "Lightning Fast",
              desc: "Built on Solana for near-instant transactions and virtually zero gas fees."
            },
            {
              icon: <ShieldCheck size={40} />,
              title: "Safe & Secure",
              desc: "Liquidity burned and contract ownership renounced. Totally safe for apes."
            },
            {
              icon: <Gem size={40} />,
              title: "Premium Meme",
              desc: "High quality art, top-tier community, and a roadmap designed for growth."
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 hover:border-bana-yellow/50 transition-all group"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-bana-yellow to-orange-500 rounded-2xl flex items-center justify-center text-bana-dark mb-6 group-hover:rotate-6 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;
