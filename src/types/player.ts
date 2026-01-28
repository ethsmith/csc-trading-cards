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

export const RARITY_STYLES: Record<CardRarity, {
  cardBg: string;
  border: string;
  headerBg: string;
  accentColor: string;
  statBg: string;
}> = {
  normal: {
    cardBg: 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900',
    border: 'border-slate-500',
    headerBg: 'bg-gradient-to-r from-slate-600 to-slate-700',
    accentColor: 'text-slate-300',
    statBg: 'bg-slate-700/80',
  },
  foil: {
    cardBg: 'bg-gradient-to-b from-blue-900 via-indigo-900 to-purple-900',
    border: 'border-blue-400',
    headerBg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
    accentColor: 'text-blue-300',
    statBg: 'bg-blue-900/80',
  },
  holo: {
    cardBg: 'bg-gradient-to-b from-fuchsia-900 via-purple-900 to-cyan-900',
    border: 'border-fuchsia-400',
    headerBg: 'bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-500',
    accentColor: 'text-fuchsia-300',
    statBg: 'bg-purple-900/80',
  },
  gold: {
    cardBg: 'bg-gradient-to-b from-yellow-700 via-amber-800 to-orange-900',
    border: 'border-yellow-400',
    headerBg: 'bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500',
    accentColor: 'text-yellow-300',
    statBg: 'bg-amber-900/80',
  },
  prismatic: {
    cardBg: 'bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950',
    border: 'border-white',
    headerBg: 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500',
    accentColor: 'text-white',
    statBg: 'bg-white/10',
  },
};

export const RARITY_TEXT_COLORS: Record<CardRarity, string> = {
  normal: 'text-white/40',
  foil: 'text-blue-400',
  holo: 'text-fuchsia-400',
  gold: 'text-amber-400',
  prismatic: 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400',
};

export const TIER_COLORS: Record<string, string> = {
  Recruit: 'text-red-400',
  Prospect: 'text-orange-400',
  Contender: 'text-yellow-400',
  Challenger: 'text-green-400',
  Elite: 'text-blue-400',
  Premier: 'text-purple-400',
};
