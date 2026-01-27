import { useState } from 'react';
import { Library, Filter, Trash2 } from 'lucide-react';
import type { TradingCard as TradingCardType, CardRarity } from '../types/player';
import { TradingCard } from './TradingCard';
import { getCollectionStats } from '../store/cardStore';

interface CollectionProps {
  cards: TradingCardType[];
  onClearCollection: () => void;
}

type SortOption = 'newest' | 'oldest' | 'rarity' | 'rating' | 'name';
type FilterRarity = CardRarity | 'all';

const RARITY_ORDER: Record<CardRarity, number> = {
  prismatic: 5,
  gold: 4,
  holo: 3,
  foil: 2,
  normal: 1,
};

export function Collection({ cards, onClearCollection }: CollectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRarity, setFilterRarity] = useState<FilterRarity>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const stats = getCollectionStats(cards);

  const tiers = [...new Set(cards.map((c) => c.player.tier?.name).filter(Boolean))];

  const filteredCards = cards
    .filter((card) => filterRarity === 'all' || card.rarity === filterRarity)
    .filter((card) => filterTier === 'all' || card.player.tier?.name === filterTier);

  const sortedCards = [...filteredCards].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return b.obtainedAt - a.obtainedAt;
      case 'oldest':
        return a.obtainedAt - b.obtainedAt;
      case 'rarity':
        return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
      case 'rating':
        return (b.player.stats?.rating ?? 0) - (a.player.stats?.rating ?? 0);
      case 'name':
        return a.player.name.localeCompare(b.player.name);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Library className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">My Collection</h2>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <span className="text-gray-400">Total:</span>{' '}
            <span className="text-white font-bold">{stats.total}</span>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-2">
            <span className="text-gray-400">Unique Players:</span>{' '}
            <span className="text-white font-bold">{stats.uniquePlayers}</span>
          </div>
          <div className="bg-gray-800 rounded-lg px-4 py-2 flex gap-3">
            <span className="text-gray-500">{stats.byRarity.normal}</span>
            <span className="text-blue-400">{stats.byRarity.foil}</span>
            <span className="text-pink-400">{stats.byRarity.holo}</span>
            <span className="text-yellow-400">{stats.byRarity.gold}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400">{stats.byRarity.prismatic}</span>
          </div>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center gap-4 bg-gray-800/50 rounded-lg p-4">
        <Filter className="w-5 h-5 text-gray-400" />

        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rarity">Rarity</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Rarity:</label>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as FilterRarity)}
            className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="normal">Normal</option>
            <option value="foil">Foil</option>
            <option value="holo">Holo</option>
            <option value="gold">Gold</option>
            <option value="prismatic">Prismatic</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-gray-400 text-sm">Tier:</label>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-1 text-sm"
          >
            <option value="all">All</option>
            {tiers.map((tier) => (
              <option key={tier} value={tier}>
                {tier}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1" />

        {cards.length > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="flex items-center gap-2 px-3 py-1 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Confirm clear modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md mx-4 space-y-4">
            <h3 className="text-xl font-bold text-white">Clear Collection?</h3>
            <p className="text-gray-400">
              This will permanently delete all {cards.length} cards from your collection. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearCollection();
                  setShowConfirmClear(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      {sortedCards.length === 0 ? (
        <div className="text-center py-16">
          <Library className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {cards.length === 0
              ? 'Your collection is empty. Open some packs to get started!'
              : 'No cards match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-items-center">
          {sortedCards.map((card) => (
            <TradingCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
