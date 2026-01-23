import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Twitter, Send } from 'lucide-react';
import { LINKS, IMAGES } from '../constants';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center md:items-start lg:items-center justify-center pt-20 md:pt-28 lg:pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-bana-dark via-black to-bana-dark z-0" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-bana-yellow/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-bana-accent/20 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 z-10 grid md:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center md:text-left"
        >
          <div className="inline-block px-4 py-2 bg-bana-yellow/10 border border-bana-yellow/30 rounded-full mb-6">
            <span className="text-bana-yellow font-bold text-sm tracking-wider uppercase">Inspired by BNB • Built on Solana</span>
          </div>
          
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl text-white mb-6 leading-none">
            IT'S <span className="text-transparent bg-clip-text bg-gradient-to-r from-bana-yellow to-yellow-200 drop-shadow-[0_2px_10px_rgba(243,186,47,0.5)]">BANA</span> <br />
            TIME
          </h1>
          
          <p className="text-gray-400 text-lg md:text-xl mb-8 max-w-lg mx-auto md:mx-0 font-light">
            The premium meme asset you've been waiting for. No utility, just pure vibe and yellow energy. Join the revolution.
          </p>

          <div className="flex flex-col sm:flex-row lg:flex-row gap-4 justify-center md:justify-start">
            <a 
              href={LINKS.TELEGRAM} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex-1 sm:flex-none px-6 lg:px-8 py-4 bg-bana-yellow text-bana-dark font-black text-lg rounded-full shadow-[0_0_20px_rgba(243,186,47,0.3)] hover:shadow-[0_0_40px_rgba(243,186,47,0.6)] transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Send size={20} />
              JOIN TELEGRAM
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </a>
            
            <a 
              href={LINKS.TWITTER}
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex-1 sm:flex-none px-6 lg:px-8 py-4 bg-transparent border-2 border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/10 hover:border-white transition-all flex items-center justify-center gap-2"
            >
              <Twitter size={20} />
              TWITTER
            </a>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          <div className="relative w-full aspect-square max-w-lg mx-auto animate-float">
             {/* Glow behind image with new pulse animation */}
            <div className="absolute inset-4 bg-bana-yellow/40 rounded-full blur-2xl animate-pulse-glow" />
            <img 
              src={IMAGES.HERO_MASCOT} 
              alt="Bana Mascot" 
              className="relative w-full h-full object-cover rounded-3xl border-4 border-bana-yellow/50 shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500" 
            />
          </div>
          
          {/* Floating badge */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute -bottom-10 right-10 bg-bana-dark/80 backdrop-blur-xl border border-bana-yellow/30 p-4 rounded-2xl shadow-xl hidden md:block"
          >
            <p className="text-gray-400 text-xs uppercase tracking-widest">Current Vibe</p>
            <p className="text-2xl font-bold text-bana-yellow">All Time High</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;