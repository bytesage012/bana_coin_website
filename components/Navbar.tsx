import React, { useState, useEffect } from 'react';
import { Menu, X, Twitter, Send, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS, LINKS, IMAGES } from '../constants';
import { NavbarProps } from '../types';

const Navbar: React.FC<NavbarProps> = ({ onPlayClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 border-b ${
        scrolled 
          ? 'bg-bana-dark/95 backdrop-blur-xl border-bana-yellow/10 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.5)]' 
          : 'bg-transparent border-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 group relative z-50">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-bana-yellow group-hover:shadow-[0_0_15px_#F3BA2F] transition-all duration-300">
            <img src={IMAGES.LOGO} alt="$BANA" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-bana-yellow/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-display text-2xl tracking-wide text-white group-hover:text-bana-yellow transition-colors duration-300">
            $BANA
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <a 
              key={item.label} 
              href={item.href}
              className="text-sm font-semibold text-gray-300 hover:text-bana-yellow transition-colors relative group py-2"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-bana-yellow transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
          <button 
            onClick={onPlayClick}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-bana-yellow/10 border border-bana-yellow/20 text-bana-yellow font-bold text-sm hover:bg-bana-yellow hover:text-bana-dark transition-all duration-300 hover:scale-105"
          >
            <Gamepad2 size={16} /> ARCADE
          </button>
        </div>

        {/* CTA & Icons */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 border-r border-white/10 pr-4">
             <a 
              href={LINKS.TELEGRAM} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#0088cc] hover:text-white transition-all duration-300"
            >
              <Send size={16} />
            </a>
            <a 
              href={LINKS.TWITTER} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#1DA1F2] hover:text-white transition-all duration-300"
            >
              <Twitter size={16} />
            </a>
          </div>

          <a 
            href={LINKS.TELEGRAM} 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-6 py-2.5 bg-bana-yellow text-bana-dark font-black text-sm uppercase tracking-wide rounded-full hover:bg-white hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(243,186,47,0.3)]"
          >
            Join Telegram
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="md:hidden text-white hover:text-bana-yellow transition-colors p-2 relative z-50"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu with Framer Motion */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: '100vh' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} // smooth easeOutQuint-ish
            className="md:hidden absolute top-0 left-0 w-full bg-bana-dark/95 backdrop-blur-xl border-b border-bana-yellow/20 overflow-hidden pt-20"
          >
            <div className="p-6 flex flex-col gap-6 h-full">
              <button 
                onClick={() => { setIsOpen(false); onPlayClick(); }}
                className="flex items-center justify-center gap-2 p-5 bg-bana-yellow/10 rounded-xl text-bana-yellow font-bold border border-bana-yellow/20 active:scale-95 transition-transform"
              >
                <Gamepad2 size={24} /> ENTER ARCADE
              </button>
              
              <div className="flex flex-col gap-6 text-center mt-4">
                {NAV_ITEMS.map((item) => (
                  <a 
                    key={item.label} 
                    href={item.href}
                    className="text-2xl font-bold text-gray-300 hover:text-bana-yellow transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>

              <div className="mt-auto pb-10">
                <div className="flex justify-center gap-8 pt-8 border-t border-white/10">
                  <a href={LINKS.TWITTER} target="_blank" className="p-4 bg-white/5 rounded-full text-white hover:bg-[#1DA1F2] transition-colors"><Twitter size={24} /></a>
                  <a href={LINKS.TELEGRAM} target="_blank" className="p-4 bg-white/5 rounded-full text-white hover:bg-[#0088cc] transition-colors"><Send size={24} /></a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;