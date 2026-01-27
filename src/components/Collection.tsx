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
    <div className="space-y-8">
      {/* Header with stats */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Library className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">My Collection</h2>
            <p className="text-sm text-white/40">{stats.total} cards collected</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5">
            <span className="text-white/50">Unique:</span>{' '}
            <span className="text-white font-semibold">{stats.uniquePlayers}</span>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 flex gap-3 font-medium">
            <span className="text-white/40">{stats.byRarity.normal}</span>
            <span className="text-blue-400">{stats.byRarity.foil}</span>
            <span className="text-fuchsia-400">{stats.byRarity.holo}</span>
            <span className="text-amber-400">{stats.byRarity.gold}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">{stats.byRarity.prismatic}</span>
          </div>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <Filter className="w-5 h-5 text-white/40" />

        <div className="flex items-center gap-2">
          <label className="text-white/40 text-sm font-medium">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rarity">Rarity</option>
            <option value="rating">Rating</option>
            <option value="name">Name</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-white/40 text-sm font-medium">Rarity:</label>
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value as FilterRarity)}
            className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50"
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
          <label className="text-white/40 text-sm font-medium">Tier:</label>
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50"
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
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Confirm clear modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 max-w-md mx-4 space-y-5 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Clear Collection?</h3>
            <p className="text-white/50 leading-relaxed">
              This will permanently delete all <span className="text-white font-semibold">{cards.length}</span> cards from your collection. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-5 py-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearCollection();
                  setShowConfirmClear(false);
                }}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-500 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cards grid */}
      {sortedCards.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
            <Library className="w-10 h-10 text-white/20" />
          </div>
          <p className="text-white/40 text-lg font-medium">
            {cards.length === 0
              ? 'Your collection is empty. Open some packs to get started!'
              : 'No cards match your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 justify-items-center">
          {sortedCards.map((card) => (
            <TradingCard key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
