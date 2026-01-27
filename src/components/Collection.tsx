import { useState, useMemo } from 'react';
import { Library, Filter, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import type { TradingCard as TradingCardType, CardRarity } from '../types/player';
import { TradingCard } from './TradingCard';

function getCollectionStats(cards: TradingCardType[]) {
  const byRarity: Record<CardRarity, number> = {
    normal: 0,
    foil: 0,
    holo: 0,
    gold: 0,
    prismatic: 0,
  };

  const uniquePlayers = new Set<string>();

  cards.forEach((card) => {
    byRarity[card.rarity]++;
    uniquePlayers.add(card.player.id);
  });

  return {
    total: cards.length,
    byRarity,
    uniquePlayers: uniquePlayers.size,
  };
}

interface CollectionProps {
  cards: TradingCardType[];
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

export function Collection({ cards }: CollectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterRarity, setFilterRarity] = useState<FilterRarity>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const stats = getCollectionStats(cards);

  const tiers = [...new Set(cards.map((c) => c.player.tier?.name).filter(Boolean))];

  const filteredCards = cards
    .filter((card) => filterRarity === 'all' || card.rarity === filterRarity)
    .filter((card) => filterTier === 'all' || card.player.tier?.name === filterTier)
    .filter((card) => searchQuery === '' || card.player.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sortedCards = useMemo(() => [...filteredCards].sort((a, b) => {
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
  }), [filteredCards, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedCards.length / perPage);
  const validPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedCards = sortedCards.slice((validPage - 1) * perPage, validPage * perPage);

  // Reset to page 1 when filters change
  const handleFilterChange = <T,>(setter: (val: T) => void, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

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

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search player..."
            className="pl-9 pr-3 py-1.5 w-48 bg-white/[0.05] border border-white/[0.08] text-white rounded-lg text-sm font-medium placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        <Filter className="w-5 h-5 text-white/40" />

        <div className="flex items-center gap-2">
          <label className="text-white/40 text-sm font-medium">Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => handleFilterChange(setSortBy, e.target.value as SortOption)}
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
            onChange={(e) => handleFilterChange(setFilterRarity, e.target.value as FilterRarity)}
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
            onChange={(e) => handleFilterChange(setFilterTier, e.target.value)}
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

        <div className="flex items-center gap-2">
          <label className="text-white/40 text-sm font-medium">Per Page:</label>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div className="flex-1" />

        {(filterRarity !== 'all' || filterTier !== 'all' || sortBy !== 'newest' || searchQuery !== '') && (
          <button
            onClick={() => {
              setFilterRarity('all');
              setFilterTier('all');
              setSortBy('newest');
              setSearchQuery('');
              setCurrentPage(1);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>

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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 justify-items-center">
            {paginatedCards.map((card) => (
              <TradingCard key={card.id} card={card} />
            ))}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validPage <= 1}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (validPage <= 3) {
                    pageNum = i + 1;
                  } else if (validPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = validPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                        pageNum === validPage
                          ? 'bg-violet-500 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validPage >= totalPages}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="text-center text-white/30 text-sm">
            Showing {(validPage - 1) * perPage + 1}-{Math.min(validPage * perPage, sortedCards.length)} of {sortedCards.length} cards
          </p>
        </>
      )}
    </div>
  );
}
