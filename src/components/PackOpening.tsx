import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { TradingCard as TradingCardType, PlayerWithStats } from '../types/player';
import { openPack } from '../store/cardStore';
import { TradingCard } from './TradingCard';

// Pre-generated particle data (deterministic pseudo-random spread)
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: ['#a855f7', '#ec4899', '#f59e0b', '#3b82f6', '#10b981'][i % 5],
  delay: i * 0.02,
  tx: ((i * 7919) % 400) - 200,
  ty: ((i * 6271) % 400) - 200,
  r: (i * 4973) % 720,
}));

interface PackOpeningProps {
  players: PlayerWithStats[];
  onCardsObtained: (cards: TradingCardType[]) => void;
}

type OpeningPhase = 'idle' | 'shaking' | 'tearing' | 'lifting' | 'exploding' | 'revealing';

export function PackOpening({ players, onCardsObtained }: PackOpeningProps) {
  const [phase, setPhase] = useState<OpeningPhase>('idle');
  const [revealedCards, setRevealedCards] = useState<TradingCardType[]>([]);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(-1);

  const handleOpenPack = () => {
    if (players.length === 0 || phase !== 'idle') return;

    const newCards = openPack(players, 5);
    
    // Phase 1: Shaking
    setPhase('shaking');
    
    // Phase 2: Tearing
    setTimeout(() => {
      setPhase('tearing');
    }, 600);
    
    // Phase 3: Lifting (pack top lifts, cards peek out)
    setTimeout(() => {
      setPhase('lifting');
    }, 1200);
    
    // Phase 4: Exploding
    setTimeout(() => {
      setPhase('exploding');
    }, 2000);
    
    // Phase 5: Revealing cards
    setTimeout(() => {
      setPhase('revealing');
      setRevealedCards(newCards);
      revealCardsSequentially(newCards);
    }, 2600);
  };

  const revealCardsSequentially = (cards: TradingCardType[]) => {
    cards.forEach((_, index) => {
      setTimeout(() => {
        setCurrentRevealIndex(index);
      }, index * 400 + 200);
    });
  };

  const handleCollectCards = () => {
    onCardsObtained(revealedCards);
    setRevealedCards([]);
    setCurrentRevealIndex(-1);
    setPhase('idle');
  };

  const isOpening = phase !== 'idle' && phase !== 'revealing';

  // Pack opening animation phase
  if (phase === 'shaking' || phase === 'tearing' || phase === 'lifting' || phase === 'exploding') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] relative">
        {/* Particle effects during explosion */}
        {phase === 'exploding' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {PARTICLES.map((p) => (
              <div
                key={p.id}
                className="absolute w-3 h-3 rounded-full animate-[particleExplode_0.8s_ease-out_forwards]"
                style={{
                  left: '50%',
                  top: '50%',
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                  '--tx': `${p.tx}px`,
                  '--ty': `${p.ty}px`,
                  '--r': `${p.r}deg`,
                } as React.CSSProperties}
              />
            ))}
          </div>
        )}
        
        {/* Light burst effect */}
        {phase === 'exploding' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-96 h-96 bg-gradient-radial from-white/40 via-fuchsia-500/20 to-transparent rounded-full animate-[lightBurst_0.6s_ease-out_forwards]" />
          </div>
        )}

        {/* The Pack */}
        <div
          className={`
            relative w-64 h-80 cursor-pointer
            transition-all duration-300
            ${phase === 'shaking' ? 'animate-[packShake_0.1s_ease-in-out_infinite]' : ''}
            ${phase === 'exploding' ? 'animate-[packExplode_0.4s_ease-out_forwards]' : ''}
          `}
          style={{ perspective: '1000px' }}
        >
          {/* Pack glow */}
          <div className={`
            absolute -inset-4 rounded-3xl blur-2xl transition-opacity duration-300
            bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500
            ${phase === 'shaking' ? 'opacity-60 animate-pulse' : ''}
            ${phase === 'tearing' || phase === 'lifting' ? 'opacity-80' : ''}
            ${phase === 'exploding' ? 'opacity-0' : 'opacity-40'}
          `} />

          {/* Card backs peeking out (visible during lifting) */}
          {(phase === 'lifting' || phase === 'exploding') && (
            <div className="absolute inset-x-4 top-8 bottom-4 flex justify-center">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-16 h-24 rounded-lg bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border border-white/20 shadow-lg"
                  style={{
                    transform: `translateX(${(i - 2) * 12}px) translateY(${Math.abs(i - 2) * 4}px) rotate(${(i - 2) * 3}deg)`,
                    zIndex: 5 - Math.abs(i - 2),
                  }}
                >
                  {/* Card back design */}
                  <div className="absolute inset-2 rounded border border-white/10 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                      <span className="text-white font-black text-xs">TC</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pack bottom half (stays in place) */}
          <div className={`
            absolute bottom-0 left-0 right-0 h-2/3 rounded-b-2xl overflow-hidden
            bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600
            border-2 border-t-0 border-white/20 shadow-2xl
            ${phase === 'lifting' ? 'z-10' : ''}
          `}>
            <div className="absolute inset-0 flex items-end justify-center pb-6">
              <p className="text-sm text-white/60">5 Cards Inside</p>
            </div>
          </div>
          
          {/* Pack top half (lifts up) */}
          <div 
            className={`
              absolute top-0 left-0 right-0 h-1/3 rounded-t-2xl overflow-hidden
              bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600
              border-2 border-b-0 border-white/20 shadow-2xl
              transition-transform duration-700 origin-bottom
              ${phase === 'lifting' ? 'animate-[packLift_0.8s_ease-out_forwards]' : ''}
              ${phase === 'exploding' ? 'opacity-0' : ''}
            `}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Pack design on top */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent" />
              <div className="w-16 h-16 rounded-xl bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <span className="text-2xl font-black text-white/90">TC</span>
              </div>
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-[packShimmer_2s_ease-in-out_infinite]" />
          </div>

          {/* Full pack (shown during shaking/tearing) */}
          {(phase === 'shaking' || phase === 'tearing') && (
            <div className={`
              absolute inset-0 rounded-2xl overflow-hidden
              bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600
              border-2 border-white/20 shadow-2xl
            `}>
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent" />
                <div className="w-24 h-24 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/10">
                  <span className="text-4xl font-black text-white/90">TC</span>
                </div>
                <h3 className="text-xl font-bold text-white text-center tracking-wide">CSC Trading Cards</h3>
                <p className="text-sm text-white/60 mt-1">5 Cards Inside</p>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-[packShimmer_2s_ease-in-out_infinite]" />
              </div>
              
              {/* Tear line indicator */}
              {phase === 'tearing' && (
                <div className="absolute top-1/3 left-0 right-0 h-1 overflow-hidden">
                  <div className="h-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.8)] animate-[tearAcross_0.6s_ease-out_forwards]" />
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Status text */}
        <p className="mt-8 text-white/60 font-medium text-lg animate-pulse">
          {phase === 'shaking' && 'Opening pack...'}
          {phase === 'tearing' && 'Tearing open...'}
          {phase === 'lifting' && 'Revealing cards...'}
          {phase === 'exploding' && '✨'}
        </p>
      </div>
    );
  }

  // Cards revealed phase
  if (phase === 'revealing' && revealedCards.length > 0) {
    return (
      <div className="flex flex-col items-center gap-8">
        <div className="flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          <h2 className="text-3xl font-bold text-white tracking-tight">Pack Opened!</h2>
          <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {revealedCards.map((card, index) => (
            <div
              key={card.id}
              className={`
                transition-all duration-500
                ${index <= currentRevealIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-75 translate-y-8'}
              `}
              style={{
                transitionDelay: index <= currentRevealIndex ? '0ms' : `${index * 100}ms`,
              }}
            >
              <TradingCard card={card} isNew={index === currentRevealIndex} />
            </div>
          ))}
        </div>

        {currentRevealIndex >= revealedCards.length - 1 && (
          <button
            onClick={handleCollectCards}
            className="mt-6 px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-bold text-lg rounded-xl
              hover:from-emerald-400 hover:to-green-400 transition-all duration-200 transform hover:scale-[1.02]
              shadow-xl shadow-emerald-500/25 border border-white/10 animate-[fadeInUp_0.5s_ease-out]"
          >
            Add to Collection
          </button>
        )}
      </div>
    );
  }

  // Idle state - show pack to click
  return (
    <div className="flex flex-col items-center gap-10">
      {/* Clickable Pack */}
      <button
        onClick={handleOpenPack}
        disabled={isOpening || players.length === 0}
        className="group relative focus:outline-none disabled:cursor-not-allowed"
      >
        {/* Pack glow on hover */}
        <div className="absolute -inset-6 rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-500" />
        
        {/* The Pack */}
        <div className={`
          relative w-64 h-80 rounded-2xl overflow-hidden
          bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600
          border-2 border-white/20 shadow-2xl
          transition-all duration-300
          group-hover:scale-105 group-hover:shadow-fuchsia-500/40
          group-active:scale-100
          group-disabled:opacity-50 group-disabled:grayscale
        `}>
          {/* Pack design */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            {/* Decorative top */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent" />
            
            {/* Logo area */}
            <div className="w-24 h-24 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl font-black text-white/90">TC</span>
            </div>
            
            <h3 className="text-xl font-bold text-white text-center tracking-wide">CSC Trading Cards</h3>
            <p className="text-sm text-white/60 mt-1">5 Cards Inside</p>
            
            {/* Click prompt */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span className="text-sm font-medium text-white/40 group-hover:text-white/70 transition-colors">
                Click to Open
              </span>
            </div>
            
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
          </div>
        </div>
      </button>

      {players.length === 0 && (
        <p className="text-white/40 text-sm font-medium">Loading players...</p>
      )}

      <div className="text-center space-y-3">
        <p className="text-white/50 font-medium">Each pack contains 5 cards</p>
        <div className="flex flex-wrap justify-center gap-3 text-sm font-medium">
          <span className="px-3 py-1.5 rounded-full bg-white/5 text-white/40 border border-white/5">Normal 69.5%</span>
          <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Foil 20%</span>
          <span className="px-3 py-1.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">Holo 8%</span>
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Gold 2%</span>
          <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 border border-fuchsia-500/20">Prismatic 0.5%</span>
        </div>
      </div>
    </div>
  );
}
