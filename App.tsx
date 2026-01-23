import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Stats from './components/Stats';
import About from './components/About';
import Tokenomics from './components/Tokenomics';
import Roadmap from './components/Roadmap';
import Footer from './components/Footer';
import LiveChart from './components/LiveChart';
import Community from './components/Community';
import ScrollToTop from './components/ScrollToTop';
import CursorTrail from './components/CursorTrail';
import FAQ from './components/FAQ';
import Game from './components/Game';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'game'>('home');

  return (
    <div className="min-h-screen bg-bana-dark text-white font-sans selection:bg-bana-yellow selection:text-black cursor-default">
      {currentView === 'home' ? (
        <>
          <CursorTrail />
          <Navbar onPlayClick={() => setCurrentView('game')} />
          <main>
            <Hero />
            <Stats />
            <About />
            <LiveChart />
            <Tokenomics />
            <Roadmap />
            <Community />
            
            {/* How To Buy Section Inline */}
            <section id="how-to-buy" className="py-24 bg-bana-yellow text-bana-dark">
              <div className="container mx-auto px-4 text-center">
                <h2 className="font-display text-5xl md:text-7xl mb-16">HOW TO BUY</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { title: "1. Create Wallet", desc: "Download Phantom or Solflare wallet from the app store." },
                    { title: "2. Get SOL", desc: "Buy Solana (SOL) from an exchange like Binance or Coinbase." },
                    { title: "3. Swap for $BANA", desc: "Go to Raydium/Jupiter, paste the $BANA address and swap." }
                  ].map((step, i) => (
                    <div key={i} className="bg-black/10 p-8 rounded-3xl border border-black/5 hover:bg-black/20 transition-all">
                      <div className="w-12 h-12 bg-black text-bana-yellow rounded-full flex items-center justify-center font-bold text-xl mx-auto mb-6">
                        {i + 1}
                      </div>
                      <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                      <p className="font-medium opacity-80">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <FAQ />
          </main>
          <Footer />
          <ScrollToTop />
        </>
      ) : (
        <Game onBack={() => setCurrentView('home')} />
      )}
    </div>
  );
};