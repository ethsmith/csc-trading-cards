import { useState } from 'react';
import { Package, Sparkles } from 'lucide-react';
import type { TradingCard as TradingCardType, PlayerWithStats } from '../types/player';
import { openPack } from '../store/cardStore';
import { TradingCard } from './TradingCard';

interface PackOpeningProps {
  players: PlayerWithStats[];
  onCardsObtained: (cards: TradingCardType[]) => void;
}

export function PackOpening({ players, onCardsObtained }: PackOpeningProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<TradingCardType[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);

  const handleOpenPack = () => {
    if (players.length === 0) return;

    setIsOpening(true);
    setRevealedCards([]);
    setCurrentRevealIndex(-1);

    const newCards = openPack(players, 5);

    setTimeout(() => {
      setRevealedCards(newCards);
      revealCardsSequentially(newCards);
    }, 1000);
  };

  const revealCardsSequentially = (cards: TradingCardType[]) => {
    cards.forEach((_, index) => {
      setTimeout(() => {
        setCurrentRevealIndex(index);
      }, index * 500);
    });

    setTimeout(() => {
      setIsOpening(false);
    }, cards.length * 500 + 500);
  };

  const handleCollectCards = () => {
    onCardsObtained(revealedCards);
    setRevealedCards([]);
    setCurrentRevealIndex(-1);
  };

  if (revealedCards.length > 0) {
    return (
      <div className="flex flex-col items-center gap-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-yellow-400" />
          Pack Opened!
          <Sparkles className="text-yellow-400" />
        </h2>

        <div className="flex flex-wrap justify-center gap-4">
          {revealedCards.map((card, index) => (
            <div
              key={card.id}
              className={`
                transition-all duration-500
                ${index <= currentRevealIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
              `}
            >
              <TradingCard card={card} isNew={index === currentRevealIndex} />
            </div>
          ))}
        </div>

        {currentRevealIndex >= revealedCards.length - 1 && (
          <button
            onClick={handleCollectCards}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg
              hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105
              shadow-lg shadow-green-500/30"
          >
            Add to Collection
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <button
        onClick={handleOpenPack}
        disabled={isOpening || players.length === 0}
        className={`
          relative group px-12 py-6 rounded-xl font-bold text-xl
          bg-gradient-to-r from-purple-600 to-pink-600
          hover:from-purple-700 hover:to-pink-700
          disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
          transition-all transform hover:scale-105
          shadow-xl shadow-purple-500/30
          ${isOpening ? 'animate-pulse' : ''}
        `}
      >
        <div className="flex items-center gap-3">
          <Package className={`w-8 h-8 ${isOpening ? 'animate-bounce' : ''}`} />
          <span>{isOpening ? 'Opening...' : 'Open Pack'}</span>
        </div>

        {!isOpening && (
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
        )}
      </button>

      {players.length === 0 && (
        <p className="text-gray-400 text-sm">Loading players...</p>
      )}

      <div className="text-center text-gray-400 text-sm space-y-1">
        <p>Each pack contains 5 cards</p>
        <p className="text-xs">
          <span className="text-gray-500">Normal: 69.5%</span> •{' '}
          <span className="text-blue-400">Foil: 20%</span> •{' '}
          <span className="text-pink-400">Holo: 8%</span> •{' '}
          <span className="text-yellow-400">Gold: 2%</span> •{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400">Prismatic: 0.5%</span>
        </p>
      </div>
    </div>
  );
}
