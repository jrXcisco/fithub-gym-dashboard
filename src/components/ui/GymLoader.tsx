interface GymLoaderProps {
  fullScreen?: boolean;
}

export function GymLoader({ fullScreen = true }: GymLoaderProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-6">
        <style>{`
          @keyframes lift-up {
            0%, 100% { 
              transform: translateY(0);
            }
            50% { 
              transform: translateY(-20px);
            }
          }
          @keyframes squat {
            0%, 100% { 
              transform: scaleY(1) translateY(0);
            }
            50% { 
              transform: scaleY(0.9) translateY(5px);
            }
          }
          @keyframes arms-lift {
            0%, 100% { 
              d: path("M30 55 L20 70 M70 55 L80 70");
            }
            50% { 
              d: path("M30 55 L15 45 M70 55 L85 45");
            }
          }
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(139, 92, 246, 0.5)); }
            50% { filter: drop-shadow(0 0 20px rgba(139, 92, 246, 0.8)); }
          }
        `}</style>

        <div className="relative w-40 h-40">
          <svg 
            viewBox="0 0 100 100" 
            className="w-full h-full"
            style={{ animation: 'glow 1.5s ease-in-out infinite' }}
          >
            {/* Person Body */}
            <g style={{ animation: 'squat 1s ease-in-out infinite', transformOrigin: 'center bottom' }}>
              {/* Head */}
              <circle cx="50" cy="25" r="10" fill="#8B5CF6" />
              
              {/* Body/Torso */}
              <rect x="42" y="35" width="16" height="25" rx="4" fill="#7C3AED" />
              
              {/* Left Leg */}
              <rect x="42" y="58" width="7" height="22" rx="3" fill="#6D28D9" />
              
              {/* Right Leg */}
              <rect x="51" y="58" width="7" height="22" rx="3" fill="#6D28D9" />
              
              {/* Left Arm */}
              <g style={{ animation: 'lift-up 1s ease-in-out infinite', transformOrigin: '35px 40px' }}>
                <rect x="25" y="38" width="18" height="6" rx="3" fill="#7C3AED" transform="rotate(-45 34 41)" />
                {/* Left hand */}
                <circle cx="22" cy="32" r="4" fill="#8B5CF6" />
              </g>
              
              {/* Right Arm */}
              <g style={{ animation: 'lift-up 1s ease-in-out infinite', transformOrigin: '65px 40px' }}>
                <rect x="57" y="38" width="18" height="6" rx="3" fill="#7C3AED" transform="rotate(45 66 41)" />
                {/* Right hand */}
                <circle cx="78" cy="32" r="4" fill="#8B5CF6" />
              </g>
            </g>
            
            {/* Barbell - moves with arms */}
            <g style={{ animation: 'lift-up 1s ease-in-out infinite' }}>
              {/* Bar */}
              <rect x="10" y="28" width="80" height="4" rx="2" fill="#A78BFA" />
              
              {/* Left Weight Plate 1 */}
              <rect x="8" y="20" width="8" height="20" rx="2" fill="#C4B5FD" />
              {/* Left Weight Plate 2 */}
              <rect x="2" y="22" width="6" height="16" rx="2" fill="#DDD6FE" />
              
              {/* Right Weight Plate 1 */}
              <rect x="84" y="20" width="8" height="20" rx="2" fill="#C4B5FD" />
              {/* Right Weight Plate 2 */}
              <rect x="92" y="22" width="6" height="16" rx="2" fill="#DDD6FE" />
            </g>
            
            {/* Ground shadow */}
            <ellipse 
              cx="50" 
              cy="85" 
              rx="25" 
              ry="5" 
              fill="rgba(0,0,0,0.3)"
              style={{ animation: 'squat 1s ease-in-out infinite', transformOrigin: 'center' }}
            />
          </svg>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-3">
          <span className="text-white font-bold text-xl tracking-wide">Loading</span>
          
          {/* Simple dots animation */}
          <div className="flex gap-2">
            <style>{`
              @keyframes bounce-dot {
                0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
                40% { transform: scale(1.2); opacity: 1; }
              }
            `}</style>
            <div 
              className="w-3 h-3 bg-purple-400 rounded-full"
              style={{ animation: 'bounce-dot 1.4s ease-in-out infinite', animationDelay: '0s' }}
            />
            <div 
              className="w-3 h-3 bg-purple-400 rounded-full"
              style={{ animation: 'bounce-dot 1.4s ease-in-out infinite', animationDelay: '0.2s' }}
            />
            <div 
              className="w-3 h-3 bg-purple-400 rounded-full"
              style={{ animation: 'bounce-dot 1.4s ease-in-out infinite', animationDelay: '0.4s' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
