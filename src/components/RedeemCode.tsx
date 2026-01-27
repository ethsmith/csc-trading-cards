import { useState } from 'react';
import { Gift, Loader2, CheckCircle, AlertCircle, Package } from 'lucide-react';
import { api } from '../api/client';

interface RedeemCodeProps {
  onCardsObtained?: () => void;
}

export function RedeemCode({ onCardsObtained }: RedeemCodeProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [packsAdded, setPacksAdded] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || loading) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await api.redeemCode(code.trim());
      setPacksAdded(result.packsAdded);
      setNewBalance(result.packBalance);
      setSuccessMessage(result.message);
      setCode('');
      onCardsObtained?.();
    } catch (err: any) {
      setError(err.message || 'Failed to redeem code');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeemAnother = () => {
    setSuccessMessage(null);
    setPacksAdded(0);
    setNewBalance(0);
  };

  if (successMessage) {
    return (
      <div className="flex flex-col items-center gap-8 py-16">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Code Redeemed!</h2>
          <p className="text-white/60 text-lg">+{packsAdded} pack{packsAdded !== 1 ? 's' : ''} added</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <Package className="w-5 h-5 text-fuchsia-400" />
          <span className="text-white/70 font-medium">
            You now have {newBalance} pack{newBalance !== 1 ? 's' : ''} to open
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleRedeemAnother}
            className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl
              hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-500/25"
          >
            Redeem Another
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
