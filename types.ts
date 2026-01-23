export interface NavItem {
  label: string;
  href: string;
}

export interface RoadmapPhase {
  title: string;
  description: string;
  items: string[];
  status: 'completed' | 'active' | 'upcoming';
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

export interface TokenStat {
  label: string;
  value: string;
}

export interface NavbarProps {
  onPlayClick: () => void;
}