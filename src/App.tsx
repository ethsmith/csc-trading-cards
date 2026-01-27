import { useState, useEffect, useCallback } from 'react';
import { Package, Library, Loader2, Eye, LogIn, LogOut, Gift, User } from 'lucide-react';
import { PackOpening } from './components/PackOpening';
import { Collection } from './components/Collection';
import { ExampleCards } from './components/ExampleCards';
import { RedeemCode } from './components/RedeemCode';
import { useAuth } from './context/AuthContext';
import { api } from './api/client';
import { apiCardToTradingCard } from './types/api';
import type { PlayerWithStats, TradingCard } from './types/player';

type Tab = 'packs' | 'collection' | 'examples' | 'redeem';

function App() {
  const { user, isLoading: authLoading, isAuthenticated, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('packs');
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [collection, setCollection] = useState<TradingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { cards } = await api.getCollection();
      setCollection(cards.map(apiCardToTradingCard));
    } catch (err) {
      console.error('Failed to fetch collection:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    api.getPlayers()
      .then(({ players: data }) => {
        setPlayers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch players:', err);
        setError('Failed to load player data. Please try again later.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCollection();
    } else {
      setCollection([]);
    }
  }, [isAuthenticated, fetchCollection]);

  const handleCardsObtained = (newCards: TradingCard[]) => {
    setCollection((prev) => [...newCards, ...prev]);
  };

  const handleClearCollection = () => {
    setCollection([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <span className="text-white font-black text-sm">TC</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  CSC Trading Cards
                </h1>
                <p className="text-xs text-white/40 font-medium">Collect • Trade • Compete</p>
              </div>
            </div>

            {/* Tab navigation */}
            <nav className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setActiveTab('packs')}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                  ${activeTab === 'packs'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }
                `}
              >
                <Package className="w-4 h-4" />
                Open Packs
              </button>
              <button
                onClick={() => setActiveTab('collection')}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                  ${activeTab === 'collection'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }
                `}
              >
                <Library className="w-4 h-4" />
                Collection
                {collection.length > 0 && (
                  <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {collection.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('redeem')}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                  ${activeTab === 'redeem'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }
                `}
              >
                <Gift className="w-4 h-4" />
                Redeem
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200
                  ${activeTab === 'examples'
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25'
                    : 'text-white/50 hover:text-white hover:bg-white/[0.06]'
                  }
                `}
              >
                <Eye className="w-4 h-4" />
                Examples
              </button>
            </nav>

            {/* Auth section */}
            <div className="flex items-center gap-3">
              {authLoading ? (
                <Loader2 className="w-5 h-5 text-white/50 animate-spin" />
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.username}
                        className="w-8 h-8 rounded-full border border-white/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-white/50" />
                      </div>
                    )}
                    <span className="text-white/70 text-sm font-medium">{user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={login}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg font-medium text-sm transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login with Discord
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-xl animate-pulse" />
              <Loader2 className="relative w-12 h-12 text-violet-400 animate-spin" />
            </div>
            <p className="mt-6 text-white/50 font-medium">Loading CSC players...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
              <p className="text-red-400 text-lg font-medium">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-6 px-6 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'packs' && (
              <div className="flex flex-col items-center py-16">
                {isAuthenticated ? (
                  <PackOpening players={players} onCardsObtained={handleCardsObtained} />
                ) : (
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
                      <Package className="w-10 h-10 text-white/20" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">Login to Open Packs</h2>
                      <p className="text-white/50">Connect your Discord account to start collecting cards</p>
                    </div>
                    <button
                      onClick={login}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-medium transition-colors"
                    >
                      <LogIn className="w-5 h-5" />
                      Login with Discord
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'collection' && (
              isAuthenticated ? (
                <Collection cards={collection} onClearCollection={handleClearCollection} />
              ) : (
                <div className="text-center py-20 space-y-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
                    <Library className="w-10 h-10 text-white/20" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Login to View Collection</h2>
                    <p className="text-white/50">Connect your Discord account to see your cards</p>
                  </div>
                  <button
                    onClick={login}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-medium transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Login with Discord
                  </button>
                </div>
              )
            )}

            {activeTab === 'redeem' && (
              isAuthenticated ? (
                <RedeemCode onCardsObtained={handleCardsObtained} />
              ) : (
                <div className="text-center py-20 space-y-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto">
                    <Gift className="w-10 h-10 text-white/20" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Login to Redeem Codes</h2>
                    <p className="text-white/50">Connect your Discord account to redeem pack codes</p>
                  </div>
                  <button
                    onClick={login}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-xl font-medium transition-colors"
                  >
                    <LogIn className="w-5 h-5" />
                    Login with Discord
                  </button>
                </div>
              )
            )}

            {activeTab === 'examples' && (
              <ExampleCards players={players} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-black/40 border-t border-white/[0.04] py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-white/30 text-sm font-medium">Player data from CSC (CS Confederation)</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
