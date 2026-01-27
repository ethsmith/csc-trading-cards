import { TradingCard } from './TradingCard';
import type { TradingCard as TradingCardType, CardRarity } from '../types/player';

const EXAMPLE_PLAYER = {
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

function createExampleCard(rarity: CardRarity): TradingCardType {
  return {
    id: `example-${rarity}`,
    player: EXAMPLE_PLAYER,
    rarity,
    obtainedAt: Date.now(),
  };
}

export function ExampleCards() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Card Rarity Examples</h2>
        <p className="text-gray-400">Preview all card rarities for testing and design review</p>
      </div>

      <div className="flex flex-wrap justify-center gap-8">
        {RARITIES.map((rarity) => (
          <div key={rarity} className="flex flex-col items-center gap-3">
            <TradingCard card={createExampleCard(rarity)} />
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
