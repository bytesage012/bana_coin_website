import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQ_DATA = [
  {
    question: "What is $BANA?",
    answer: "$BANA is a community-driven meme asset on the Solana blockchain. It is inspired by the legacy of BNB but built for the high-speed, low-cost Solana ecosystem. It has no utility other than being strictly yellow and vibe-heavy."
  },
  {
    question: "How can I buy $BANA?",
    answer: "You can buy $BANA on decentralized exchanges (DEX) like Raydium or Jupiter. You'll need a Solana wallet (like Phantom) and some SOL tokens to swap."
  },
  {
    question: "Is there a team allocation?",
    answer: "Only 5% of the supply is vested for the team to ensure long-term commitment. 90% of the liquidity was burned at launch to ensure a fair and safe start for the community."
  },
  {
    question: "What is the contract address?",
    answer: "The official contract address is: 8anaD3f4u1tPl4c3h0ld3rAddre55F0rY0urC01n. Always verify the address on official channels before swapping."
  },
  {
    question: "When marketing?",
    answer: "Marketing is ongoing! We are constantly raiding Twitter, partnering with influencers, and creating premium memes. The community is the marketing department."
  }
];

const FAQ: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-bana-dark relative">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <span className="text-bana-yellow text-sm font-bold tracking-widest uppercase mb-2 block">Common Questions</span>
          <h2 className="font-display text-5xl md:text-6xl text-white">
            FAQ <span className="text-bana-yellow">CORNER</span>
          </h2>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-white/10 rounded-2xl bg-white/5 overflow-hidden"
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-bold text-lg md:text-xl text-white flex items-center gap-3">
                  <HelpCircle size={20} className="text-bana-yellow" />
                  {item.question}
                </span>
                <ChevronDown 
                  className={`text-gray-400 transition-transform duration-300 ${activeIndex === index ? 'rotate-180 text-bana-yellow' : ''}`} 
                />
              </button>
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;