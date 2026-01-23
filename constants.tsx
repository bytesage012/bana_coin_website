import React from 'react';
import { NavItem, RoadmapPhase, TokenStat } from './types';

// Images
export const IMAGES = {
  HERO_MASCOT: "/G_RgkU5XYAA1Mq-.jpeg",
  LOGO: "/G_RgkU5XYAA1Mq-.jpeg",
  ABOUT_BG: "/G_RgkU5XYAA1Mq-.jpeg",
};

export const LINKS = {
  TELEGRAM: "https://t.me/Banamemecoin",
  TWITTER: "https://x.com/Banamemecoin",
  DEX: "#", 
  CONTRACT: "8anaD3f4u1tPl4c3h0ld3rAddre55F0rY0urC01n",
  SOLSCAN: "https://solscan.io/token/8anaD3f4u1tPl4c3h0ld3rAddre55F0rY0urC01n",
  RAYDIUM: "https://raydium.io/swap",
  JUPITER: "https://jup.ag/swap",
  DEXSCREENER: "https://dexscreener.com",
};

export const NAV_ITEMS: NavItem[] = [
  { label: 'About', href: '#about' },
  { label: 'Chart', href: '#chart' },
  { label: 'Tokenomics', href: '#tokenomics' },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'Community', href: '#community' },
];

export const TOKENOMICS_DATA = [
  { name: 'Liquidity Pool', value: 90, fill: '#F3BA2F' },
  { name: 'Marketing', value: 5, fill: '#FFFFFF' },
  { name: 'Team (Vested)', value: 5, fill: '#9945FF' },
];

export const ROADMAP: RoadmapPhase[] = [
  {
    title: "Phase 1: The Peel",
    description: "Launch and initial community building.",
    items: ["Website Launch", "Social Media Setup", "Fair Launch on Solana", "1,000 Holders"],
    status: 'active',
  },
  {
    title: "Phase 2: The Ripe",
    description: "Marketing blitz and partnerships.",
    items: ["CMC & CG Listing", "Trending on Twitter", "Strategic Partnerships", "5,000 Holders"],
    status: 'upcoming',
  },
  {
    title: "Phase 3: The Split",
    description: "Utility and massive expansion.",
    items: ["BANA Merch Store", "Tier 1 CEX Listings", "BananaDAO Governance", "To The Moon"],
    status: 'upcoming',
  },
];

export const STATS: TokenStat[] = [
  { label: 'Total Supply', value: '1,000,000,000' },
  { label: 'Taxes', value: '0% / 0%' },
  { label: 'Liquidity', value: 'Burned' },
  { label: 'Network', value: 'Solana' },
];

export const MEMES = [
  "https://picsum.photos/400/400?random=10",
  "https://picsum.photos/400/500?random=11",
  "https://picsum.photos/400/300?random=12",
  "https://picsum.photos/400/450?random=13",
  "https://picsum.photos/400/400?random=14",
  "https://picsum.photos/400/350?random=15",
];

export const TESTIMONIALS = [
  { user: "@CryptoKing", text: "Most bullish chart I've seen all month. $BANA to the moon! 🚀" },
  { user: "@SolanaApe", text: "Finally a meme coin with a real community. The vibes are immaculate." },
  { user: "@BananaWhale", text: "I sold my car to buy more $BANA. No regrets." },
];

// Mock Chart Data Generator
export const generateChartData = () => {
  const data = [];
  let price = 0.0042;
  for (let i = 0; i < 50; i++) {
    const change = (Math.random() - 0.45) * 0.0005;
    price = Math.max(0.001, price + change);
    data.push({
      time: `${i}m`,
      price: price,
      pv: Math.floor(Math.random() * 10000) + 1000
    });
  }
  return data;
};
