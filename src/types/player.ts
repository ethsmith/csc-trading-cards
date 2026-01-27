export interface CscPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  steam64Id: string;
  discordId?: string;
  mmr?: number;
  tier: {
    name: string;
  };
  team?: {
    name: string;
    franchise: {
      name: string;
      prefix: string;
    };
  };
  type?: string;
}

export interface PlayerStats {
  name: string;
  rating: number;
  kr: number;
  adr: number;
  kast: number;
  impact: number;
  gameCount: number;
  rounds: number;
  kills: number;
  deaths: number;
  assists: number;
}

export interface PlayerWithStats extends CscPlayer {
  stats?: PlayerStats;
}

export type CardRarity = 'normal' | 'foil' | 'holo' | 'gold' | 'prismatic';

export interface TradingCard {
  id: string;
  player: PlayerWithStats;
  rarity: CardRarity;
  obtainedAt: number;
}

export const RARITY_WEIGHTS: Record<CardRarity, number> = {
  normal: 69.5,
  foil: 20,
  holo: 8,
  gold: 2,
  prismatic: 0.5,
};

export const RARITY_COLORS: Record<CardRarity, { border: string; bg: string; glow: string }> = {
  normal: {
    border: 'border-gray-500',
    bg: 'bg-gradient-to-br from-gray-700 to-gray-900',
    glow: '',
  },
  foil: {
    border: 'border-blue-400',
    bg: 'bg-gradient-to-br from-blue-600 to-purple-700',
    glow: 'shadow-lg shadow-blue-500/50',
  },
  holo: {
    border: 'border-pink-400',
    bg: 'bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500',
    glow: 'shadow-xl shadow-pink-500/50 animate-pulse',
  },
  gold: {
    border: 'border-yellow-400',
    bg: 'bg-gradient-to-br from-yellow-500 via-amber-400 to-yellow-600',
    glow: 'shadow-2xl shadow-yellow-500/70',
  },
  prismatic: {
    border: 'border-white',
    bg: 'bg-gradient-to-br from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
    glow: 'shadow-2xl shadow-white/50',
  },
};

export const TIER_COLORS: Record<string, string> = {
  Recruit: 'text-red-400',
  Prospect: 'text-orange-400',
  Contender: 'text-yellow-400',
  Challenger: 'text-green-400',
  Elite: 'text-blue-400',
  Premier: 'text-purple-400',
};
