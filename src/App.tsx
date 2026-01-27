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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CSC Trading Cards
            </h1>

            {/* Tab navigation */}
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('packs')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${activeTab === 'packs'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Package className="w-5 h-5" />
                Open Packs
              </button>
              <button
                onClick={() => setActiveTab('collection')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${activeTab === 'collection'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Library className="w-5 h-5" />
                Collection
                {collection.length > 0 && (
                  <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {collection.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
                  ${activeTab === 'examples'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <Eye className="w-5 h-5" />
                Examples
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <p className="text-gray-400">Loading CSC players...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-red-400 text-lg">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'packs' && (
              <div className="flex flex-col items-center py-12">
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
      <footer className="bg-black/30 border-t border-white/10 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Player data from CSC (CS Confederation)</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
