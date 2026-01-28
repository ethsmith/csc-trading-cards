import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Package, Loader2, Check, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import { apiCardToTradingCard } from '../types/api';
import type { OwnedCard } from '../types/api';
import { TradingCard } from './TradingCard';

interface DuplicateConverterProps {
  onBack: () => void;
  onPackBalanceChange?: (newBalance: number) => void;
}

const CARDS_PER_PACK = 15;

export function DuplicateConverter({ onBack, onPackBalanceChange }: DuplicateConverterProps) {
  const [loading, setLoading] = useState(true);
  const [collection, setCollection] = useState<OwnedCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [trading, setTrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tradeSuccess, setTradeSuccess] = useState<{ packBalance: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const fetchCollection = async () => {
    setLoading(true);
    setError(null);
    try {
      const { cards } = await api.getCollection();
      setCollection(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch collection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  // Filter to only normal rarity cards and group by snapshot to find duplicates
  const tradeableCards = useMemo(() => {
    const normalCards = collection.filter((card) => card.rarity === 'normal');
    
    // Group by snapshot ID
    const grouped: Record<string, OwnedCard[]> = {};
    normalCards.forEach((card) => {
      const snapshotId = card.cardSnapshotId || card.snapshot?.id;
      if (!grouped[snapshotId]) {
        grouped[snapshotId] = [];
      }
      grouped[snapshotId].push(card);
    });

    // Find tradeable cards (all except one per snapshot)
    const tradeable: OwnedCard[] = [];

    Object.values(grouped).forEach((cards) => {
      if (cards.length > 1) {
        // Sort by obtained date, keep the oldest one
        cards.sort((a, b) => new Date(a.obtainedAt).getTime() - new Date(b.obtainedAt).getTime());
        // Add all except the first (oldest) to tradeable
        tradeable.push(...cards.slice(1));
      }
    });

    return tradeable;
  }, [collection]);

  const packsAvailable = Math.floor(tradeableCards.length / CARDS_PER_PACK);

  // Pagination
  const totalPages = Math.ceil(tradeableCards.length / perPage);
  const validPage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedCards = tradeableCards.slice((validPage - 1) * perPage, validPage * perPage);

  const toggleCard = (cardId: string) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else if (next.size < CARDS_PER_PACK) {
        next.add(cardId);
      }
      return next;
    });
  };

  const selectAll = () => {
    const toSelect = tradeableCards.slice(0, CARDS_PER_PACK).map((c) => c.id);
    setSelectedCards(new Set(toSelect));
  };

  const clearSelection = () => {
    setSelectedCards(new Set());
  };

  const handleTrade = async () => {
    if (selectedCards.size !== CARDS_PER_PACK) return;

    setTrading(true);
    setError(null);
    try {
      const result = await api.tradeDuplicates(Array.from(selectedCards));
      setTradeSuccess({ packBalance: result.packBalance });
      onPackBalanceChange?.(result.packBalance);
      setSelectedCards(new Set());
      // Refresh collection
      await fetchCollection();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trade duplicates');
    } finally {
      setTrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
        <p className="mt-4 text-white/50 font-medium">Loading duplicates...</p>
      </div>
    );
  }

  if (tradeSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Trade Successful!</h2>
          <p className="text-white/50">You received 1 pack</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/[0.05] border border-white/[0.08] rounded-xl">
            <Package className="w-5 h-5 text-violet-400" />
            <span className="text-white font-medium">Pack Balance: {tradeSuccess.packBalance}</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setTradeSuccess(null)}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Trade More
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Convert Duplicates</h2>
              <p className="text-sm text-white/40">Trade {CARDS_PER_PACK} normal duplicates for 1 pack</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white/40 text-sm">Tradeable Cards</p>
            <p className="text-white font-bold">{tradeableCards.length}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-sm">Packs Available</p>
            <p className="text-emerald-400 font-bold">{packsAvailable}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          {error}
        </div>
      )}

      {tradeableCards.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Duplicates Available</h3>
          <p className="text-white/50 max-w-md mx-auto">
            You don't have any normal rarity duplicate cards to trade. Keep opening packs to collect more!
          </p>
          <button
            onClick={onBack}
            className="mt-6 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium transition-colors"
          >
            Back to Collection
          </button>
        </div>
      ) : (
        <>
          {/* Selection controls */}
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <div className="flex items-center gap-4">
              <span className="text-white font-medium">
                Selected: <span className={selectedCards.size === CARDS_PER_PACK ? 'text-emerald-400' : 'text-violet-400'}>{selectedCards.size}</span> / {CARDS_PER_PACK}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  disabled={tradeableCards.length < CARDS_PER_PACK}
                  className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  Select {CARDS_PER_PACK}
                </button>
                <button
                  onClick={clearSelection}
                  disabled={selectedCards.size === 0}
                  className="px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            <button
              onClick={handleTrade}
              disabled={selectedCards.size !== CARDS_PER_PACK || trading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {trading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Trading...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  Trade for Pack
                </>
              )}
            </button>
          </div>

          {/* Info banner */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-amber-200 text-sm">
            <strong>Note:</strong> Only normal rarity cards are shown. You'll always keep at least one copy of each card - only extras can be traded.
          </div>

          {/* Per page selector */}
          <div className="flex items-center gap-2">
            <label className="text-white/40 text-sm font-medium">Cards per page:</label>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={16}>16</option>
              <option value={24}>24</option>
            </select>
          </div>

          {/* Cards grid - same layout as Trading */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedCards.map((card) => {
              const tradingCard = apiCardToTradingCard(card);
              const isSelected = selectedCards.has(card.id);

              return (
                <div key={card.id} className="relative">
                  <button
                    onClick={() => toggleCard(card.id)}
                    disabled={!isSelected && selectedCards.size >= CARDS_PER_PACK}
                    className={`relative ${!isSelected && selectedCards.size >= CARDS_PER_PACK ? 'opacity-50' : ''}`}
                  >
                    <TradingCard card={tradingCard} />
                    {isSelected && (
                      <>
                        <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-500 pointer-events-none" />
                        <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
            {paginatedCards.length === 0 && (
              <div className="col-span-4 flex items-center justify-center py-12 text-white/40 text-sm">
                No cards on this page
              </div>
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-4">
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
            Showing {(validPage - 1) * perPage + 1}-{Math.min(validPage * perPage, tradeableCards.length)} of {tradeableCards.length} tradeable cards
          </p>
        </>
      )}
    </div>
  );
}
