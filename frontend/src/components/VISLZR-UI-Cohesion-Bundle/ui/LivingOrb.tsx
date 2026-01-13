/**
 * Living Orb - A glowing, pulsing sphere that indicates active awareness.
 *
 * Used as the toggle for the Living Context panel.
 * - isActive: AI has been active recently (glowing/pulsing)
 * - isPanelOpen: The context panel is open (ring indicator)
 */

interface LivingOrbProps {
  isActive?: boolean;
  isPanelOpen?: boolean;
  size?: number;
  onClick?: () => void;
}

export default function LivingOrb({ isActive = false, isPanelOpen = false, size = 24, onClick }: LivingOrbProps) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center p-2 rounded-lg transition-all hover:bg-cc-border/50 ${
        isPanelOpen ? 'bg-purple-900/30' : ''
      }`}
      title="Living Context (Project Memory)"
    >
      {/* Outer glow */}
      <div
        className={`absolute rounded-full transition-all duration-500 ${
          isActive
            ? 'opacity-60 blur-md animate-pulse'
            : 'opacity-30 blur-sm'
        }`}
        style={{
          width: size * 1.5,
          height: size * 1.5,
          background: isActive
            ? 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(59,130,246,0.4) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, rgba(107,114,128,0.2) 50%, transparent 70%)',
        }}
      />

      {/* Inner orb */}
      <div
        className={`relative rounded-full transition-all duration-300 ${
          isActive ? 'shadow-lg shadow-purple-500/50' : ''
        }`}
        style={{
          width: size,
          height: size,
          background: isActive
            ? 'radial-gradient(circle at 30% 30%, rgba(196,167,255,1) 0%, rgba(168,85,247,1) 40%, rgba(99,102,241,1) 100%)'
            : 'radial-gradient(circle at 30% 30%, rgba(156,163,175,0.8) 0%, rgba(107,114,128,0.6) 40%, rgba(75,85,99,0.8) 100%)',
          boxShadow: isActive
            ? 'inset -2px -2px 4px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.2)'
            : 'inset -1px -1px 2px rgba(0,0,0,0.2), inset 1px 1px 2px rgba(255,255,255,0.1)',
        }}
      >
        {/* Highlight spot */}
        <div
          className="absolute rounded-full opacity-60"
          style={{
            width: size * 0.3,
            height: size * 0.3,
            top: '15%',
            left: '20%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Animated ping ring (when AI is active) */}
      {isActive && (
        <div
          className="absolute rounded-full animate-ping opacity-20"
          style={{
            width: size * 1.2,
            height: size * 1.2,
            border: '1px solid rgba(168,85,247,0.6)',
          }}
        />
      )}

      {/* Panel open indicator ring */}
      {isPanelOpen && (
        <div
          className="absolute rounded-full"
          style={{
            width: size * 1.4,
            height: size * 1.4,
            border: '2px solid rgba(168,85,247,0.5)',
          }}
        />
      )}
    </button>
  );
}
