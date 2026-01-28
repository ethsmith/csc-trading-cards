import { useState } from 'react';
import type { TradingCard as TradingCardType } from '../types/player';
import { RARITY_STYLES } from '../types/player';

interface TradingCardProps {
  card: TradingCardType;
  isNew?: boolean;
  onClick?: () => void;
}


export function TradingCard({ card, isNew, onClick }: TradingCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { player, rarity } = card;
  const styles = RARITY_STYLES[rarity];

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onClick?.();
  };

  const stats = player.stats;
  const kpr = stats?.kr?.toFixed(2) ?? 'N/A';
  const dpr = stats?.rounds ? (stats.deaths / stats.rounds).toFixed(2) : 'N/A';
  const rating = stats?.rating?.toFixed(2) ?? 'N/A';
  const impact = stats?.impact?.toFixed(2) ?? 'N/A';

  return (
    <div
      onClick={handleClick}
      className={`
        group relative w-72 h-[420px] cursor-pointer
        transform transition-transform duration-500 hover:scale-105
        ${isNew ? 'animate-[cardReveal_0.6s_ease-out]' : ''}
      `}
      style={{ perspective: '1000px' }}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card */}
        <div
          className={`
            absolute inset-0 rounded-2xl border-2 ${styles.border} ${styles.cardBg}
            flex flex-col overflow-hidden
            ${rarity === 'gold' ? 'shadow-[0_0_30px_rgba(234,179,8,0.4)]' : ''}
            ${rarity === 'holo' ? 'shadow-[0_0_25px_rgba(217,70,239,0.4)]' : ''}
            ${rarity === 'foil' ? 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' : ''}
            ${rarity === 'prismatic' ? 'shadow-[0_0_50px_rgba(168,85,247,0.4)]' : ''}
          `}
          style={{ backfaceVisibility: 'hidden' }}
        >
      {/* Animated background patterns */}
      {rarity === 'holo' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_200%] animate-[holoShine_3s_linear_infinite]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </>
      )}
      
      {rarity === 'foil' && (
        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.15)_50%,transparent_60%)] bg-[length:300%_300%] animate-[foilShine_4s_ease-in-out_infinite]" />
      )}
      
      {rarity === 'gold' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,215,0,0.2)_50%,transparent_100%)] bg-[length:200%_100%] animate-[goldShimmer_2s_ease-in-out_infinite]" />
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
        </>
      )}
      
      {rarity === 'prismatic' && (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.4)_40%,rgba(255,200,255,0.3)_50%,rgba(200,255,255,0.3)_60%,transparent_80%)] bg-[length:300%_100%] animate-[holoWave_3s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_20%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.2)_0%,transparent_15%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.25)_0%,transparent_18%)] animate-[sparkle_2s_ease-in-out_infinite]" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-cyan-500/20" />
        </>
      )}

      {/* Top decorative header */}
      <div className={`${styles.headerBg} px-4 py-3 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative flex justify-between items-center">
          <span className={`text-xs font-bold uppercase tracking-wider ${styles.accentColor}`}>
            {player.tier?.name}
          </span>
          <span
            className={`
              px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
              ${rarity === 'gold' ? 'bg-gradient-to-r from-yellow-300 to-amber-400 text-black shadow-lg' : ''}
              ${rarity === 'holo' ? 'bg-gradient-to-r from-fuchsia-400 via-purple-400 to-cyan-400 text-white shadow-lg' : ''}
              ${rarity === 'foil' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white shadow-md' : ''}
              ${rarity === 'normal' ? 'bg-slate-500 text-white' : ''}
              ${rarity === 'prismatic' ? 'bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 text-black shadow-lg animate-[prismaticBadge_2s_linear_infinite] bg-[length:200%_100%]' : ''}
            `}
          >
            {rarity}
          </span>
        </div>
      </div>

      {/* Player image section */}
      <div className="relative flex-1 flex items-center justify-center py-6 px-4">
        {/* Decorative rings behind avatar */}
        <div className={`absolute w-44 h-44 rounded-full border ${styles.border} opacity-20`} />
        <div className={`absolute w-52 h-52 rounded-full border ${styles.border} opacity-10`} />
        
        <div className="relative">
          {/* Glow effect behind avatar */}
          <div className={`
            absolute -inset-4 rounded-full blur-xl opacity-60
            ${rarity === 'gold' ? 'bg-yellow-500' : ''}
            ${rarity === 'holo' ? 'bg-gradient-to-br from-fuchsia-500 to-cyan-500' : ''}
            ${rarity === 'foil' ? 'bg-blue-500' : ''}
            ${rarity === 'normal' ? 'bg-slate-500' : ''}
            ${rarity === 'prismatic' ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 animate-pulse' : ''}
          `} />
          
          {/* Avatar container */}
          <div className={`
            relative w-36 h-36 rounded-full p-1
            ${rarity === 'gold' ? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500' : ''}
            ${rarity === 'holo' ? 'bg-gradient-to-br from-fuchsia-400 via-purple-500 to-cyan-400' : ''}
            ${rarity === 'foil' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' : ''}
            ${rarity === 'normal' ? 'bg-gradient-to-br from-slate-400 to-slate-600' : ''}
            ${rarity === 'prismatic' ? 'bg-gradient-to-r from-violet-400 via-fuchsia-400 via-pink-400 via-rose-400 to-violet-400 bg-[length:200%_100%] animate-[prismaticBadge_3s_linear_infinite] p-1.5' : ''}
          `}>
            <img
              src={player.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}
              alt={player.name}
              className="w-full h-full rounded-full object-cover border-2 border-black/30"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://cdn.discordapp.com/embed/avatars/0.png';
              }}
            />
          </div>
          
          {/* Animated ring for gold */}
          {rarity === 'gold' && (
            <div className="absolute -inset-2 rounded-full border-2 border-yellow-400/60 animate-[ping_2s_ease-in-out_infinite]" />
          )}
                  </div>
      </div>

      {/* Player name banner */}
      <div className="relative bg-black/70 backdrop-blur-sm px-4 py-3 border-t border-white/10">
        <h3 className="text-xl font-black text-white text-center tracking-wide truncate">
          {player.name}
        </h3>
        {player.team && (
          <p className="text-xs text-center text-gray-400 mt-1 truncate">
            {player.team.franchise.prefix} {player.team.name}
          </p>
        )}
      </div>

      {/* Stats section */}
      <div className="bg-black/50 backdrop-blur-sm p-4 border-t border-white/5">
        <div className="grid grid-cols-4 gap-2">
          <div className={`${styles.statBg} rounded-lg p-2 text-center backdrop-blur-sm border border-white/5`}>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">RTG</div>
            <div className={`text-sm font-black ${styles.accentColor}`}>{rating}</div>
          </div>
          <div className={`${styles.statBg} rounded-lg p-2 text-center backdrop-blur-sm border border-white/5`}>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">IMP</div>
            <div className={`text-sm font-black ${styles.accentColor}`}>{impact}</div>
          </div>
          <div className={`${styles.statBg} rounded-lg p-2 text-center backdrop-blur-sm border border-white/5`}>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">KPR</div>
            <div className={`text-sm font-black ${styles.accentColor}`}>{kpr}</div>
          </div>
          <div className={`${styles.statBg} rounded-lg p-2 text-center backdrop-blur-sm border border-white/5`}>
            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">DPR</div>
            <div className={`text-sm font-black ${styles.accentColor}`}>{dpr}</div>
          </div>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className={`h-1.5 ${styles.headerBg}`} />
        </div>

        {/* Back of card */}
        <div
          className={`
            absolute inset-0 rounded-2xl border-2 ${styles.border}
            flex flex-col items-center justify-center overflow-hidden
            ${styles.cardBg}
            ${rarity === 'gold' ? 'shadow-[0_0_30px_rgba(234,179,8,0.4)]' : ''}
            ${rarity === 'holo' ? 'shadow-[0_0_25px_rgba(217,70,239,0.4)]' : ''}
            ${rarity === 'foil' ? 'shadow-[0_0_20px_rgba(59,130,246,0.3)]' : ''}
            ${rarity === 'prismatic' ? 'shadow-[0_0_50px_rgba(168,85,247,0.4)]' : ''}
          `}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* Animated background patterns for back */}
          {rarity === 'holo' && (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:200%_200%] animate-[holoShine_3s_linear_infinite]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
            </>
          )}
          
          {rarity === 'foil' && (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.15)_50%,transparent_60%)] bg-[length:300%_300%] animate-[foilShine_4s_ease-in-out_infinite]" />
          )}
          
          {rarity === 'gold' && (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,215,0,0.2)_50%,transparent_100%)] bg-[length:200%_100%] animate-[goldShimmer_2s_ease-in-out_infinite]" />
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
            </>
          )}
          
          {rarity === 'prismatic' && (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.4)_40%,rgba(255,200,255,0.3)_50%,rgba(200,255,255,0.3)_60%,transparent_80%)] bg-[length:300%_100%] animate-[holoWave_3s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3)_0%,transparent_20%),radial-gradient(circle_at_70%_60%,rgba(255,255,255,0.2)_0%,transparent_15%),radial-gradient(circle_at_50%_80%,rgba(255,255,255,0.25)_0%,transparent_18%)] animate-[sparkle_2s_ease-in-out_infinite]" />
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-cyan-500/20" />
            </>
          )}

          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-4 border-2 border-white/30 rounded-xl" />
            <div className="absolute inset-8 border border-white/20 rounded-lg" />
          </div>

          {/* Center logo/design */}
          <div className={`
            relative w-32 h-32 rounded-full flex items-center justify-center
            ${rarity === 'gold' ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : ''}
            ${rarity === 'holo' ? 'bg-gradient-to-br from-fuchsia-500 to-cyan-500' : ''}
            ${rarity === 'foil' ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : ''}
            ${rarity === 'normal' ? 'bg-gradient-to-br from-slate-500 to-slate-700' : ''}
            ${rarity === 'prismatic' ? 'bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 animate-pulse' : ''}
          `}>
            <div className="absolute inset-1 rounded-full bg-slate-900 flex items-center justify-center">
              <span className="text-4xl font-black text-white/80">TC</span>
            </div>
          </div>

          {/* Rarity indicator */}
          <div className={`
            mt-6 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest
            ${rarity === 'gold' ? 'bg-gradient-to-r from-yellow-400 to-amber-500 text-black' : ''}
            ${rarity === 'holo' ? 'bg-gradient-to-r from-fuchsia-400 to-cyan-400 text-white' : ''}
            ${rarity === 'foil' ? 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white' : ''}
            ${rarity === 'normal' ? 'bg-slate-600 text-white' : ''}
            ${rarity === 'prismatic' ? 'bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 text-white' : ''}
          `}>
            {rarity}
          </div>

          {/* Bottom accent */}
          <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${styles.headerBg}`} />
        </div>
      </div>
    </div>
  );
}
