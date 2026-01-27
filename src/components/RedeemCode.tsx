import { useState } from 'react';
import { Gift, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../api/client';
import { apiCardToTradingCard } from '../types/api';
import type { TradingCard as TradingCardType } from '../types/player';
import { TradingCard } from './TradingCard';

interface RedeemCodeProps {
  onCardsObtained: (cards: TradingCardType[]) => void;
}

export function RedeemCode({ onCardsObtained }: RedeemCodeProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [redeemedCards, setRedeemedCards] = useState<TradingCardType[]>([]);
  const [showCards, setShowCards] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await api.redeemCode(code.trim());
      const cards = result.allCards.map(apiCardToTradingCard);
      setRedeemedCards(cards);
      setSuccess(true);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  const handleCollectCards = () => {
    onCardsObtained(redeemedCards);
    setRedeemedCards([]);
    setSuccess(false);
    setShowCards(false);
  };

  if (success && redeemedCards.length > 0) {
    if (showCards) {
      return (
        <div className="flex flex-col items-center gap-8 py-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            <h2 className="text-3xl font-bold text-white tracking-tight">Code Redeemed!</h2>
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>

          <p className="text-white/60">You received {redeemedCards.length} cards!</p>

          <div className="flex flex-wrap justify-center gap-6 max-w-6xl">
            {redeemedCards.map((card) => (
              <TradingCard key={card.id} card={card} />
            ))}
          </div>

          <button
            onClick={handleCollectCards}
            className="mt-6 px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-xl
              hover:from-emerald-400 hover:to-green-400 transition-all duration-200 transform hover:scale-[1.02]
              shadow-xl shadow-emerald-500/25 border border-white/10"
          >
            Add to Collection
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-8 py-16">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Code Redeemed!</h2>
          <p className="text-white/60 text-lg">You received {redeemedCards.length} cards</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCards(true)}
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl
              hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-500/25"
          >
            View Cards
          </button>
          <button
            onClick={handleCollectCards}
            className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-colors"
          >
            Add to Collection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 py-16 max-w-md mx-auto">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
        <Gift className="w-10 h-10 text-white" />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Redeem Pack Code</h2>
        <p className="text-white/50">Enter a code to receive free packs</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code..."
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/30 
              focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all
              font-mono text-center text-lg tracking-wider"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl
            hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-500/25
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-violet-600 disabled:hover:to-fuchsia-600
            flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Redeeming...
            </>
          ) : (
            <>
              <Gift className="w-5 h-5" />
              Redeem Code
            </>
          )}
        </button>
      </form>

      <p className="text-white/30 text-sm text-center">
        Pack codes can be obtained from events, giveaways, or administrators.
      </p>
    </div>
  );
}
