import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { TradingCard } from './TradingCard';
import type { TradingCard as TradingCardType, CardRarity, PlayerWithStats } from '../types/player';

interface ExampleCardsProps {
  players: PlayerWithStats[];
}

const DEFAULT_PLAYER = {
  id: 'example-player',
  name: 'Example Player',
  avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
  steam64Id: '76561198000000000',
  tier: { name: 'Elite' },
  team: {
    name: 'Example Team',
    franchise: {
      name: 'Example Franchise',
      prefix: 'EX',
    },
  },
  stats: {
    name: 'Example Player',
    rating: 1.25,
    kr: 0.85,
    adr: 82.5,
    kast: 72.3,
    impact: 1.15,
    gameCount: 24,
    rounds: 576,
    kills: 489,
    deaths: 412,
    assists: 156,
  },
};

const RARITIES: CardRarity[] = ['normal', 'foil', 'holo', 'gold', 'prismatic'];

function createExampleCard(player: PlayerWithStats, rarity: CardRarity): TradingCardType {
  return {
    id: `example-${rarity}`,
    player,
    rarity,
    obtainedAt: Date.now(),
  };
}

export function ExampleCards({ players }: ExampleCardsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithStats | null>(null);

  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return players
      .filter((p) => p.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [players, searchQuery]);

  const displayPlayer = selectedPlayer || DEFAULT_PLAYER;
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Card Rarity Examples</h2>
        <p className="text-gray-400">Preview all card rarities for testing and design review</p>
      </div>

      {/* Player search */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value.trim()) setSelectedPlayer(null);
            }}
            placeholder="Search for a player..."
            className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.08] text-white rounded-xl text-sm font-medium placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          
          {/* Search results dropdown */}
          {filteredPlayers.length > 0 && !selectedPlayer && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10">
              {filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => {
                    setSelectedPlayer(player);
                    setSearchQuery(player.name);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <img
                    src={player.avatarUrl}
                    alt={player.name}
                    className="w-8 h-8 rounded-full bg-white/10"
                  />
                  <div>
                    <p className="text-white font-medium text-sm">{player.name}</p>
                    <p className="text-white/40 text-xs">
                      {player.team?.franchise?.prefix} • {player.tier?.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <div className="text-center">
          <span className="text-white/50 text-sm">Showing cards for: </span>
          <span className="text-white font-medium">{selectedPlayer.name}</span>
          <button
            onClick={() => {
              setSelectedPlayer(null);
              setSearchQuery('');
            }}
            className="ml-2 text-violet-400 hover:text-violet-300 text-sm font-medium"
          >
            Clear
          </button>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-8">
        {RARITIES.map((rarity) => (
          <div key={rarity} className="flex flex-col items-center gap-3">
            <TradingCard card={createExampleCard(displayPlayer, rarity)} />
            <div className="text-center">
              <span className={`
                text-sm font-bold uppercase
                ${rarity === 'normal' ? 'text-slate-400' : ''}
                ${rarity === 'foil' ? 'text-blue-400' : ''}
                ${rarity === 'holo' ? 'text-fuchsia-400' : ''}
                ${rarity === 'gold' ? 'text-yellow-400' : ''}
                ${rarity === 'prismatic' ? 'text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400' : ''}
              `}>
                {rarity}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {rarity === 'normal' && '69.5% drop rate'}
                {rarity === 'foil' && '20% drop rate'}
                {rarity === 'holo' && '8% drop rate'}
                {rarity === 'gold' && '2% drop rate'}
                {rarity === 'prismatic' && '0.5% drop rate'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
