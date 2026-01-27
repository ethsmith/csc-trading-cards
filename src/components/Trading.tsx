import { useState, useEffect, useMemo } from 'react';
import { ArrowLeftRight, Search, Check, X, Clock, ChevronDown, ChevronUp, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../api/client';
import { apiCardToTradingCard } from '../types/api';
import type { TradeOffer, OwnedCard } from '../types/api';
import { TradingCard } from './TradingCard';
import type { TradingCard as TradingCardType, CardRarity } from '../types/player';

type TradeTab = 'incoming' | 'outgoing' | 'create';
type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';
type SortOption = 'newest' | 'oldest' | 'rarity' | 'rating' | 'name';
type FilterRarity = CardRarity | 'all';

const RARITY_ORDER: Record<CardRarity, number> = {
  prismatic: 5,
  gold: 4,
  holo: 3,
  foil: 2,
  normal: 1,
};

interface UserSearchResult {
  discordId: string;
  username: string;
  avatarUrl: string | null;
}

export function Trading() {
  const [activeTab, setActiveTab] = useState<TradeTab>('incoming');
  const [trades, setTrades] = useState<TradeOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create trade state
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [myCards, setMyCards] = useState<TradingCardType[]>([]);
  const [theirCards, setTheirCards] = useState<TradingCardType[]>([]);
  const [selectedOffered, setSelectedOffered] = useState<Set<string>>(new Set());
  const [selectedRequested, setSelectedRequested] = useState<Set<string>>(new Set());
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Filter and pagination state for my cards
  const [mySort, setMySort] = useState<SortOption>('newest');
  const [myRarity, setMyRarity] = useState<FilterRarity>('all');
  const [myTier, setMyTier] = useState<string>('all');
  const [mySearch, setMySearch] = useState('');
  const [myPage, setMyPage] = useState(1);

  // Filter and pagination state for their cards
  const [theirSort, setTheirSort] = useState<SortOption>('newest');
  const [theirRarity, setTheirRarity] = useState<FilterRarity>('all');
  const [theirTier, setTheirTier] = useState<string>('all');
  const [theirSearch, setTheirSearch] = useState('');
  const [theirPage, setTheirPage] = useState(1);

  const CARDS_PER_PAGE = 8;

  useEffect(() => {
    fetchTrades();
  }, []);

  useEffect(() => {
    if (activeTab === 'create') {
      fetchMyCards();
    }
  }, [activeTab]);

  useEffect(() => {
    const searchUsers = async () => {
      if (userSearch.trim().length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const { users } = await api.searchUsers(userSearch);
        setSearchResults(users);
      } catch (err) {
        console.error('Failed to search users:', err);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [userSearch]);

  useEffect(() => {
    if (selectedUser) {
      fetchTheirCards(selectedUser.discordId);
    } else {
      setTheirCards([]);
      setSelectedRequested(new Set());
    }
  }, [selectedUser]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const { trades: data } = await api.getTrades('all');
      setTrades(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyCards = async () => {
    try {
      const { cards } = await api.getCollection();
      setMyCards(cards.map(apiCardToTradingCard));
    } catch (err) {
      console.error('Failed to fetch my cards:', err);
    }
  };

  const fetchTheirCards = async (discordId: string) => {
    try {
      const { cards } = await api.getUserCollection(discordId);
      setTheirCards(cards.map(apiCardToTradingCard));
    } catch (err) {
      console.error('Failed to fetch their cards:', err);
    }
  };

  const handleAccept = async (tradeId: string) => {
    setActionLoading(tradeId);
    try {
      await api.acceptTrade(tradeId);
      await fetchTrades();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to accept trade');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (tradeId: string) => {
    setActionLoading(tradeId);
    try {
      await api.rejectTrade(tradeId);
      await fetchTrades();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject trade');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (tradeId: string) => {
    setActionLoading(tradeId);
    try {
      await api.cancelTrade(tradeId);
      await fetchTrades();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to cancel trade');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateTrade = async () => {
    if (!selectedUser || (selectedOffered.size === 0 && selectedRequested.size === 0)) {
      setCreateError('Select at least one card to trade');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);

    try {
      await api.createTrade(
        selectedUser.discordId,
        Array.from(selectedOffered),
        Array.from(selectedRequested)
      );
      // Reset form
      setSelectedUser(null);
      setUserSearch('');
      setSelectedOffered(new Set());
      setSelectedRequested(new Set());
      setActiveTab('outgoing');
      await fetchTrades();
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create trade');
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleCardSelection = (cardId: string, type: 'offered' | 'requested') => {
    if (type === 'offered') {
      setSelectedOffered((prev) => {
        const next = new Set(prev);
        if (next.has(cardId)) {
          next.delete(cardId);
        } else {
          next.add(cardId);
        }
        return next;
      });
    } else {
      setSelectedRequested((prev) => {
        const next = new Set(prev);
        if (next.has(cardId)) {
          next.delete(cardId);
        } else {
          next.add(cardId);
        }
        return next;
      });
    }
  };

  const incomingTrades = useMemo(
    () => trades.filter((t) => t.toUserId && t.status === 'pending'),
    [trades]
  );

  const outgoingTrades = useMemo(
    () => trades.filter((t) => t.fromUserId && t.status === 'pending'),
    [trades]
  );

  // Get unique tiers from cards
  const myTiers = useMemo(() => [...new Set(myCards.map((c) => c.player.tier?.name).filter(Boolean))], [myCards]);
  const theirTiers = useMemo(() => [...new Set(theirCards.map((c) => c.player.tier?.name).filter(Boolean))], [theirCards]);

  // Filter and sort my cards
  const filteredMyCards = useMemo(() => {
    const cards = myCards
      .filter((card) => myRarity === 'all' || card.rarity === myRarity)
      .filter((card) => myTier === 'all' || card.player.tier?.name === myTier)
      .filter((card) => mySearch === '' || card.player.name.toLowerCase().includes(mySearch.toLowerCase()));

    return cards.sort((a, b) => {
      switch (mySort) {
        case 'newest': return b.obtainedAt - a.obtainedAt;
        case 'oldest': return a.obtainedAt - b.obtainedAt;
        case 'rarity': return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
        case 'rating': return (b.player.stats?.rating || 0) - (a.player.stats?.rating || 0);
        case 'name': return a.player.name.localeCompare(b.player.name);
        default: return 0;
      }
    });
  }, [myCards, myRarity, myTier, mySort, mySearch]);

  // Filter and sort their cards
  const filteredTheirCards = useMemo(() => {
    const cards = theirCards
      .filter((card) => theirRarity === 'all' || card.rarity === theirRarity)
      .filter((card) => theirTier === 'all' || card.player.tier?.name === theirTier)
      .filter((card) => theirSearch === '' || card.player.name.toLowerCase().includes(theirSearch.toLowerCase()));

    return cards.sort((a, b) => {
      switch (theirSort) {
        case 'newest': return b.obtainedAt - a.obtainedAt;
        case 'oldest': return a.obtainedAt - b.obtainedAt;
        case 'rarity': return RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity];
        case 'rating': return (b.player.stats?.rating || 0) - (a.player.stats?.rating || 0);
        case 'name': return a.player.name.localeCompare(b.player.name);
        default: return 0;
      }
    });
  }, [theirCards, theirRarity, theirTier, theirSort, theirSearch]);

  // Paginate
  const myTotalPages = Math.ceil(filteredMyCards.length / CARDS_PER_PAGE);
  const theirTotalPages = Math.ceil(filteredTheirCards.length / CARDS_PER_PAGE);
  const paginatedMyCards = filteredMyCards.slice((myPage - 1) * CARDS_PER_PAGE, myPage * CARDS_PER_PAGE);
  const paginatedTheirCards = filteredTheirCards.slice((theirPage - 1) * CARDS_PER_PAGE, theirPage * CARDS_PER_PAGE);

  const getStatusColor = (status: TradeStatus) => {
    switch (status) {
      case 'pending':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'accepted':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'rejected':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'cancelled':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const renderTradeCard = (card: OwnedCard) => {
    const tradingCard = apiCardToTradingCard(card);
    return (
      <div key={card.id} className="transform scale-75 origin-top-left">
        <TradingCard card={tradingCard} />
      </div>
    );
  };

  const renderTrade = (trade: TradeOffer, isIncoming: boolean) => {
    const isExpanded = expandedTrade === trade.id;
    const isLoading = actionLoading === trade.id;

    return (
      <div
        key={trade.id}
        className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden"
      >
        <button
          onClick={() => setExpandedTrade(isExpanded ? null : trade.id)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-white/50" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">
                {isIncoming ? 'From' : 'To'}: {isIncoming ? trade.fromUserId : trade.toUserId}
              </p>
              <p className="text-white/40 text-sm">
                {trade.offeredCards.length} card{trade.offeredCards.length !== 1 ? 's' : ''} offered •{' '}
                {trade.requestedCards.length} card{trade.requestedCards.length !== 1 ? 's' : ''} requested
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(trade.status)}`}>
              {trade.status}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-white/40" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/40" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="border-t border-white/[0.06] p-4 space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-white/60 text-sm font-medium mb-3">
                  {isIncoming ? 'You will receive' : 'You are offering'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trade.offeredCards.map(renderTradeCard)}
                </div>
              </div>
              <div>
                <h4 className="text-white/60 text-sm font-medium mb-3">
                  {isIncoming ? 'You will give' : 'You are requesting'}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trade.requestedCards.map(renderTradeCard)}
                </div>
              </div>
            </div>

            {trade.status === 'pending' && (
              <div className="flex justify-end gap-3 pt-4 border-t border-white/[0.06]">
                {isIncoming ? (
                  <>
                    <button
                      onClick={() => handleReject(trade.id)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAccept(trade.id)}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      Accept
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleCancel(trade.id)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel Trade
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <ArrowLeftRight className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Trading</h2>
          <p className="text-sm text-white/40">Trade cards with other players</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white/[0.02] p-1 rounded-xl border border-white/[0.06] w-fit">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'incoming'
              ? 'bg-violet-600 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          Incoming
          {incomingTrades.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {incomingTrades.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'outgoing'
              ? 'bg-violet-600 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          Outgoing
          {outgoingTrades.length > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
              {outgoingTrades.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'create'
              ? 'bg-violet-600 text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          New Trade
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Clock className="w-8 h-8 text-white/30 animate-spin" />
        </div>
      ) : (
        <>
          {activeTab === 'incoming' && (
            <div className="space-y-4">
              {incomingTrades.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                    <ArrowLeftRight className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-medium">No incoming trade offers</p>
                </div>
              ) : (
                incomingTrades.map((trade) => renderTrade(trade, true))
              )}
            </div>
          )}

          {activeTab === 'outgoing' && (
            <div className="space-y-4">
              {outgoingTrades.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                    <ArrowLeftRight className="w-8 h-8 text-white/20" />
                  </div>
                  <p className="text-white/40 font-medium">No outgoing trade offers</p>
                </div>
              ) : (
                outgoingTrades.map((trade) => renderTrade(trade, false))
              )}
            </div>
          )}

          {activeTab === 'create' && (
            <div className="space-y-6">
              {/* User search */}
              <div className="space-y-2">
                <label className="text-white/60 text-sm font-medium">Trade with</label>
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={selectedUser ? selectedUser.username : userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setSelectedUser(null);
                    }}
                    placeholder="Search for a player..."
                    className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] text-white rounded-xl text-sm font-medium placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />

                  {searchResults.length > 0 && !selectedUser && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10">
                      {searchResults.map((user) => (
                        <button
                          key={user.discordId}
                          onClick={() => {
                            setSelectedUser(user);
                            setSearchResults([]);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                        >
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.username}
                              className="w-8 h-8 rounded-full bg-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-white/50" />
                            </div>
                          )}
                          <span className="text-white font-medium text-sm">{user.username}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedUser && (
                <>
                  {/* Two column layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left column - Your cards */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">Your Cards</h3>
                        <span className="text-emerald-400 text-sm font-medium">
                          {selectedOffered.size} selected
                        </span>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          value={mySearch}
                          onChange={(e) => { setMySearch(e.target.value); setMyPage(1); }}
                          placeholder="Search player..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white/[0.05] border border-white/[0.08] text-white rounded-lg text-xs font-medium placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={mySort}
                          onChange={(e) => { setMySort(e.target.value as SortOption); setMyPage(1); }}
                          className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
                        >
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="rarity">Rarity</option>
                          <option value="rating">Rating</option>
                          <option value="name">Name</option>
                        </select>
                        <select
                          value={myRarity}
                          onChange={(e) => { setMyRarity(e.target.value as FilterRarity); setMyPage(1); }}
                          className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
                        >
                          <option value="all">All Rarities</option>
                          <option value="normal">Normal</option>
                          <option value="foil">Foil</option>
                          <option value="holo">Holo</option>
                          <option value="gold">Gold</option>
                          <option value="prismatic">Prismatic</option>
                        </select>
                        <select
                          value={myTier}
                          onChange={(e) => { setMyTier(e.target.value); setMyPage(1); }}
                          className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
                        >
                          <option value="all">All Tiers</option>
                          {myTiers.map((tier) => (
                            <option key={tier} value={tier}>{tier}</option>
                          ))}
                        </select>
                      </div>

                      {/* Cards grid */}
                      <div className="grid grid-cols-2 gap-3 min-h-[400px]">
                        {paginatedMyCards.map((card) => (
                          <button
                            key={card.id}
                            onClick={() => toggleCardSelection(card.id, 'offered')}
                            className={`relative rounded-2xl transition-all ${
                              selectedOffered.has(card.id)
                                ? 'ring-2 ring-offset-2 ring-offset-transparent ring-emerald-500'
                                : 'hover:ring-2 hover:ring-white/20'
                            }`}
                          >
                            <TradingCard card={card} />
                            {selectedOffered.has(card.id) && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                        {paginatedMyCards.length === 0 && (
                          <div className="col-span-2 flex items-center justify-center text-white/40 text-sm">
                            No cards match filters
                          </div>
                        )}
                      </div>

                      {/* Pagination */}
                      {myTotalPages > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                          <span className="text-white/40 text-xs">
                            Page {myPage} of {myTotalPages}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setMyPage((p) => Math.max(1, p - 1))}
                              disabled={myPage === 1}
                              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4 text-white/60" />
                            </button>
                            <button
                              onClick={() => setMyPage((p) => Math.min(myTotalPages, p + 1))}
                              disabled={myPage === myTotalPages}
                              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-4 h-4 text-white/60" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right column - Their cards */}
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white font-medium">{selectedUser.username}'s Cards</h3>
                        <span className="text-fuchsia-400 text-sm font-medium">
                          {selectedRequested.size} selected
                        </span>
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="text"
                          value={theirSearch}
                          onChange={(e) => { setTheirSearch(e.target.value); setTheirPage(1); }}
                          placeholder="Search player..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white/[0.05] border border-white/[0.08] text-white rounded-lg text-xs font-medium placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        />
                      </div>

                      {/* Filters */}
                      <div className="flex flex-wrap gap-2">
                        <select
                          value={theirSort}
                          onChange={(e) => { setTheirSort(e.target.value as SortOption); setTheirPage(1); }}
                          className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
                        >
                          <option value="newest">Newest</option>
                          <option value="oldest">Oldest</option>
                          <option value="rarity">Rarity</option>
                          <option value="rating">Rating</option>
                          <option value="name">Name</option>
                        </select>
                        <select
                          value={theirRarity}
                          onChange={(e) => { setTheirRarity(e.target.value as FilterRarity); setTheirPage(1); }}
                          className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
                        >
                          <option value="all">All Rarities</option>
                          <option value="normal">Normal</option>
                          <option value="foil">Foil</option>
                          <option value="holo">Holo</option>
                          <option value="gold">Gold</option>
                          <option value="prismatic">Prismatic</option>
                        </select>
                        <select
                          value={theirTier}
                          onChange={(e) => { setTheirTier(e.target.value); setTheirPage(1); }}
                          className="bg-white/[0.05] border border-white/[0.08] text-white rounded-lg px-2 py-1 text-xs font-medium focus:outline-none"
                        >
                          <option value="all">All Tiers</option>
                          {theirTiers.map((tier) => (
                            <option key={tier} value={tier}>{tier}</option>
                          ))}
                        </select>
                      </div>

                      {/* Cards grid */}
                      <div className="grid grid-cols-2 gap-3 min-h-[400px]">
                        {theirCards.length === 0 ? (
                          <div className="col-span-2 flex items-center justify-center text-white/40 text-sm">
                            This user has no cards
                          </div>
                        ) : paginatedTheirCards.length === 0 ? (
                          <div className="col-span-2 flex items-center justify-center text-white/40 text-sm">
                            No cards match filters
                          </div>
                        ) : (
                          paginatedTheirCards.map((card) => (
                            <button
                              key={card.id}
                              onClick={() => toggleCardSelection(card.id, 'requested')}
                              className={`relative rounded-2xl transition-all ${
                                selectedRequested.has(card.id)
                                  ? 'ring-2 ring-offset-2 ring-offset-transparent ring-fuchsia-500'
                                  : 'hover:ring-2 hover:ring-white/20'
                              }`}
                            >
                              <TradingCard card={card} />
                              {selectedRequested.has(card.id) && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-fuchsia-500 rounded-full flex items-center justify-center z-10">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                            </button>
                          ))
                        )}
                      </div>

                      {/* Pagination */}
                      {theirTotalPages > 1 && (
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                          <span className="text-white/40 text-xs">
                            Page {theirPage} of {theirTotalPages}
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setTheirPage((p) => Math.max(1, p - 1))}
                              disabled={theirPage === 1}
                              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="w-4 h-4 text-white/60" />
                            </button>
                            <button
                              onClick={() => setTheirPage((p) => Math.min(theirTotalPages, p + 1))}
                              disabled={theirPage === theirTotalPages}
                              className="p-1 rounded hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="w-4 h-4 text-white/60" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary and submit */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">Trade Summary</p>
                        <p className="text-white/40 text-sm">
                          Offering {selectedOffered.size} card{selectedOffered.size !== 1 ? 's' : ''} •
                          Requesting {selectedRequested.size} card{selectedRequested.size !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={handleCreateTrade}
                        disabled={createLoading || (selectedOffered.size === 0 && selectedRequested.size === 0)}
                        className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-medium rounded-xl hover:from-violet-500 hover:to-fuchsia-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createLoading ? 'Creating...' : 'Send Trade Offer'}
                      </button>
                    </div>
                    {createError && (
                      <p className="text-red-400 text-sm">{createError}</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
