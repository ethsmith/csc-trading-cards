import { useState, useEffect } from 'react';
import { Gift, Loader2, CheckCircle, Package, Clock, Sparkles, Ticket, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

interface PendingGift {
  id: string;
  name: string;
  packCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export function Gifts() {
  const [gifts, setGifts] = useState<PendingGift[]>([]);
  const [totalPacks, setTotalPacks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newBalance, setNewBalance] = useState(0);
  const [code, setCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccess, setRedeemSuccess] = useState<{ packsAdded: number; balance: number } | null>(null);

  const fetchGifts = async () => {
    try {
      const result = await api.getPendingGifts();
      setGifts(result.gifts);
      setTotalPacks(result.totalPacks);
    } catch (err) {
      console.error('Failed to fetch gifts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleClaimGift = async (giftId: string) => {
    setClaiming(giftId);
    try {
      const result = await api.claimGift(giftId);
      setNewBalance(result.newPackBalance);
      await fetchGifts();
    } catch (err) {
      console.error('Failed to claim gift:', err);
    } finally {
      setClaiming(null);
    }
  };

  const handleClaimAll = async () => {
    setClaimingAll(true);
    try {
      const result = await api.claimAllGifts();
      if (result.giftsClaimed > 0) {
        setSuccessMessage(`Claimed ${result.giftsClaimed} gift${result.giftsClaimed !== 1 ? 's' : ''} for ${result.totalPacks} packs!`);
        setNewBalance(result.newPackBalance);
      }
      await fetchGifts();
    } catch (err) {
      console.error('Failed to claim all gifts:', err);
    } finally {
      setClaimingAll(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatExpiry = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expired';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    return `Expires ${formatDate(dateString)}`;
  };

  const handleRedeemCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || redeemLoading) return;

    setRedeemLoading(true);
    setRedeemError(null);
    setRedeemSuccess(null);

    try {
      const result = await api.redeemCode(code.trim());
      setRedeemSuccess({ packsAdded: result.packsAdded, balance: result.packBalance });
      setCode('');
    } catch (err: any) {
      setRedeemError(err.message || 'Failed to redeem code');
    } finally {
      setRedeemLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
        <p className="mt-4 text-white/50 font-medium">Loading gifts...</p>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="flex flex-col items-center gap-8 py-16">
        <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Gifts Claimed!</h2>
          <p className="text-white/60 text-lg">{successMessage}</p>
        </div>
        <div className="flex items-center gap-3 px-6 py-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
          <Package className="w-5 h-5 text-fuchsia-400" />
          <span className="text-white/70 font-medium">
            You now have {newBalance} pack{newBalance !== 1 ? 's' : ''} to open
          </span>
        </div>
        <button
          onClick={() => setSuccessMessage(null)}
          className="px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl
            hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-500/25"
        >
          Back to Gifts
        </button>
      </div>
    );
  }

  const RedeemCodeSection = () => (
    <div className="p-6 bg-white/[0.03] border border-white/[0.06] rounded-2xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Ticket className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Redeem Code</h3>
          <p className="text-white/50 text-sm">Enter a pack code to receive packs</p>
        </div>
      </div>

      <form onSubmit={handleRedeemCode} className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter your code..."
            className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-white placeholder-white/30 
              focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all
              font-mono text-center tracking-wider"
            disabled={redeemLoading}
          />
          <button
            type="submit"
            disabled={!code.trim() || redeemLoading}
            className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl
              hover:from-amber-400 hover:to-orange-400 transition-all duration-200 shadow-lg shadow-amber-500/25
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {redeemLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Ticket className="w-5 h-5" />
            )}
            Redeem
          </button>
        </div>

        {redeemError && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{redeemError}</span>
          </div>
        )}

        {redeemSuccess && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">
              +{redeemSuccess.packsAdded} pack{redeemSuccess.packsAdded !== 1 ? 's' : ''} added! You now have {redeemSuccess.balance} packs.
            </span>
          </div>
        )}
      </form>
    </div>
  );

  if (gifts.length === 0) {
    return (
      <div className="space-y-8 py-8">
        <RedeemCodeSection />
        
        <div className="flex flex-col items-center gap-6 py-12">
          <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
            <Gift className="w-10 h-10 text-white/20" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">No Pending Gifts</h2>
            <p className="text-white/50">Check back later for new gifts!</p>
          </div>
          <p className="text-white/30 text-sm text-center max-w-md">
            You'll receive a daily login bonus of 3 packs each day you log in.
            Special gifts may also appear during events!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <RedeemCodeSection />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Your Gifts</h2>
          <p className="text-white/50 mt-1">
            {gifts.length} gift{gifts.length !== 1 ? 's' : ''} waiting • {totalPacks} total packs
          </p>
        </div>
        {gifts.length > 1 && (
          <button
            onClick={handleClaimAll}
            disabled={claimingAll}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-xl
              hover:from-violet-500 hover:to-fuchsia-500 transition-all duration-200 shadow-lg shadow-violet-500/25
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claimingAll ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Claiming...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Claim All ({totalPacks} packs)
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid gap-4">
        {gifts.map((gift) => (
          <div
            key={gift.id}
            className="flex items-center justify-between p-5 bg-white/[0.03] border border-white/[0.06] rounded-2xl
              hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Gift className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{gift.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-white/60 text-sm">
                    {gift.packCount} pack{gift.packCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-white/40 text-sm">
                    {formatDate(gift.createdAt)}
                  </span>
                  {gift.expiresAt && (
                    <>
                      <span className="text-white/20">•</span>
                      <span className="flex items-center gap-1 text-amber-400/80 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        {formatExpiry(gift.expiresAt)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleClaimGift(gift.id)}
              disabled={claiming === gift.id || claimingAll}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium rounded-xl
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {claiming === gift.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  Claim
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
