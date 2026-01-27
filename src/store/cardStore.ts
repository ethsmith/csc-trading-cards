import type { CardRarity, PlayerWithStats, TradingCard } from '../types/player';
import { RARITY_WEIGHTS } from '../types/player';

const STORAGE_KEY = 'csc-trading-cards-collection';

function generateCardId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function rollRarity(): CardRarity {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    random -= weight;
    if (random <= 0) {
      return rarity as CardRarity;
    }
  }

  return 'normal';
}

export function loadCollection(): TradingCard[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCollection(cards: TradingCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function openPack(
  players: PlayerWithStats[],
  packSize: number = 5
): TradingCard[] {
  if (players.length === 0) return [];

  const eligiblePlayers = players.filter((p) => p.stats && p.stats.gameCount > 0);
  if (eligiblePlayers.length === 0) return [];

  const newCards: TradingCard[] = [];

  for (let i = 0; i < packSize; i++) {
    const randomPlayer = eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];
    const rarity = rollRarity();

    newCards.push({
      id: generateCardId(),
      player: randomPlayer,
      rarity,
      obtainedAt: Date.now(),
    });
  }

  return newCards;
}

export function addCardsToCollection(
  collection: TradingCard[],
  newCards: TradingCard[]
): TradingCard[] {
  const updated = [...collection, ...newCards];
  saveCollection(updated);
  return updated;
}

export function getCollectionStats(collection: TradingCard[]) {
  const byRarity: Record<CardRarity, number> = {
    normal: 0,
    foil: 0,
    holo: 0,
    gold: 0,
    prismatic: 0,
  };

  const uniquePlayers = new Set<string>();

  collection.forEach((card) => {
    byRarity[card.rarity]++;
    uniquePlayers.add(card.player.id);
  });

  return {
    total: collection.length,
    byRarity,
    uniquePlayers: uniquePlayers.size,
  };
}
