import { useState, useEffect } from 'react';
import { Package, Library, Loader2, Eye } from 'lucide-react';
import { PackOpening } from './components/PackOpening';
import { Collection } from './components/Collection';
import { ExampleCards } from './components/ExampleCards';
import { fetchPlayersWithStats } from './api/csc';
import { loadCollection, addCardsToCollection, saveCollection } from './store/cardStore';
import type { PlayerWithStats, TradingCard } from './types/player';

type Tab = 'packs' | 'collection' | 'examples';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('packs');
  const [players, setPlayers] = useState<PlayerWithStats[]>([]);
  const [collection, setCollection] = useState<TradingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCollection(loadCollection());

    fetchPlayersWithStats()
      .then((data) => {
        setPlayers(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch players:', err);
        setError('Failed to load player data. Please try again later.');
        setLoading(false);
      });
  }, []);

  const handleCardsObtained = (newCards: TradingCard[]) => {
    const updated = addCardsToCollection(collection, newCards);
    setCollection(updated);
  };

  const handleClearCollection = () => {
    setCollection([]);
    saveCollection([]);
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
                <PackOpening players={players} onCardsObtained={handleCardsObtained} />
              </div>
            )}

            {activeTab === 'collection' && (
              <Collection cards={collection} onClearCollection={handleClearCollection} />
            )}

            {activeTab === 'examples' && (
              <ExampleCards />
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
