import React from 'react';
import { LINKS } from '../constants';
import { Twitter, Send } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black py-16 border-t border-white/10">
      <div className="container mx-auto px-4 flex flex-col items-center text-center">
        
        <h2 className="font-display text-6xl text-white mb-8">$BANA</h2>
        
        <div className="flex gap-6 mb-12">
          <a href={LINKS.TELEGRAM} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-bana-yellow hover:text-bana-dark transition-all">
            <Send size={24} />
          </a>
          <a href={LINKS.TWITTER} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-bana-yellow hover:text-bana-dark transition-all">
            <Twitter size={24} />
          </a>
        </div>

        <p className="text-gray-500 max-w-2xl text-sm leading-relaxed mb-8">
          DISCLAIMER: $BANA is a meme coin with no intrinsic value or expectation of financial return. 
          There is no formal team or roadmap. The coin is completely useless and for entertainment purposes only. 
          Crypto is risky, never invest more than you can afford to lose.
        </p>

        <p className="text-gray-700 text-xs">
          © {new Date().getFullYear()} $BANA Community. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
