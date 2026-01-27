import type { CardRarity } from './player';

export interface CardSnapshot {
  id: string;
  cscPlayerId: string;
  playerName: string;
  avatarUrl: string;
  season: number;
  statType: 'Regulation' | 'Combine';
  tier: string;
  teamName: string | null;
  franchiseName: string | null;
  franchisePrefix: string | null;
  mmr: number | null;
  rating: number;
  kr: number;
  adr: number;
  kast: number;
  impact: number;
  gameCount: number;
  kills: number;
  deaths: number;
  assists: number;
  createdAt: string;
}

export interface OwnedCard {
  id: string;
  discordUserId: string;
  cardSnapshotId: string;
  rarity: CardRarity;
  obtainedAt: string;
  snapshot: CardSnapshot;
}

export interface ApiUser {
  discordId: string;
  username: string;
  avatar: string | null;
  avatarUrl: string | null;
}

export interface TradeOffer {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  offeredCards: OwnedCard[];
  requestedCards: OwnedCard[];
}

export function apiCardToTradingCard(card: OwnedCard) {
  const snapshot = card.snapshot;
  return {
    id: card.id,
    player: {
      id: snapshot.cscPlayerId,
      name: snapshot.playerName,
      avatarUrl: snapshot.avatarUrl,
      steam64Id: '',
      tier: { name: snapshot.tier },
      team: snapshot.teamName ? {
        name: snapshot.teamName,
        franchise: {
          name: snapshot.franchiseName || '',
          prefix: snapshot.franchisePrefix || '',
        },
      } : undefined,
      mmr: snapshot.mmr || undefined,
      stats: {
        name: snapshot.playerName,
        rating: snapshot.rating,
        kr: snapshot.kr,
        adr: snapshot.adr,
        kast: snapshot.kast,
        impact: snapshot.impact,
        gameCount: snapshot.gameCount,
        rounds: 0,
        kills: snapshot.kills,
        deaths: snapshot.deaths,
        assists: snapshot.assists,
      },
    },
    rarity: card.rarity,
    obtainedAt: new Date(card.obtainedAt).getTime(),
    season: snapshot.season,
    statType: snapshot.statType,
  };
}
