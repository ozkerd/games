import React from 'react';

interface HangmanDrawingProps {
  wrongGuessesCount: number;
  isWon?: boolean;
}

export const HangmanDrawing: React.FC<HangmanDrawingProps> = ({
  wrongGuessesCount,
  isWon = false,
}) => {
  return (
    <div className="relative flex items-center justify-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800 shadow-inner">
      <svg
        viewBox="0 0 240 280"
        className="w-full max-w-[260px] h-auto stroke-current"
        style={{ filter: 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.15))' }}
      >
        {/* Base & Structure */}
        {/* Ground */}
        <line
          x1="20"
          y1="250"
          x2="220"
          y2="250"
          className="stroke-slate-700"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Pole */}
        <line
          x1="60"
          y1="250"
          x2="60"
          y2="30"
          className="stroke-slate-600"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Top Beam */}
        <line
          x1="57"
          y1="30"
          x2="160"
          y2="30"
          className="stroke-slate-600"
          strokeWidth="6"
          strokeLinecap="round"
        />

        {/* Diagonal Support */}
        <line
          x1="60"
          y1="70"
          x2="100"
          y2="30"
          className="stroke-slate-700"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Rope */}
        <line
          x1="160"
          y1="30"
          x2="160"
          y2="70"
          className="stroke-amber-600/80"
          strokeWidth="4"
          strokeDasharray="4 2"
        />

        {/* Body Parts based on wrong guesses */}

        {/* 1. Head */}
        {wrongGuessesCount >= 1 && (
          <g className="transition-all duration-300">
            <circle
              cx="160"
              cy="90"
              r="20"
              className={isWon ? 'stroke-emerald-400 fill-emerald-950/40' : 'stroke-indigo-400 fill-slate-900'}
              strokeWidth="4"
            />
            {/* Eyes */}
            {wrongGuessesCount >= 6 ? (
              // X eyes on defeat
              <g className="stroke-rose-500" strokeWidth="2.5" strokeLinecap="round">
                <line x1="152" y1="84" x2="158" y2="90" />
                <line x1="158" y1="84" x2="152" y2="90" />
                <line x1="162" y1="84" x2="168" y2="90" />
                <line x1="168" y1="84" x2="162" y2="90" />
              </g>
            ) : isWon ? (
              // Happy eyes on win
              <g className="stroke-emerald-400" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M152 87 Q155 83 158 87" />
                <path d="M162 87 Q165 83 168 87" />
              </g>
            ) : (
              // Normal eyes
              <g className="fill-indigo-300">
                <circle cx="154" cy="87" r="2.5" />
                <circle cx="166" cy="87" r="2.5" />
              </g>
            )}

            {/* Mouth */}
            {wrongGuessesCount >= 6 ? (
              <path d="M154 100 Q160 95 166 100" fill="none" className="stroke-rose-500" strokeWidth="2" strokeLinecap="round" />
            ) : isWon ? (
              <path d="M153 96 Q160 104 167 96" fill="none" className="stroke-emerald-400" strokeWidth="2.5" strokeLinecap="round" />
            ) : (
              <line x1="155" y1="98" x2="165" y2="98" className="stroke-indigo-300" strokeWidth="2" strokeLinecap="round" />
            )}
          </g>
        )}

        {/* 2. Torso */}
        {wrongGuessesCount >= 2 && (
          <line
            x1="160"
            y1="110"
            x2="160"
            y2="170"
            className={isWon ? 'stroke-emerald-400' : wrongGuessesCount >= 6 ? 'stroke-rose-400' : 'stroke-indigo-400'}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* 3. Left Arm */}
        {wrongGuessesCount >= 3 && (
          <line
            x1="160"
            y1="125"
            x2="130"
            y2="150"
            className={isWon ? 'stroke-emerald-400' : wrongGuessesCount >= 6 ? 'stroke-rose-400' : 'stroke-indigo-400'}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* 4. Right Arm */}
        {wrongGuessesCount >= 4 && (
          <line
            x1="160"
            y1="125"
            x2="190"
            y2="150"
            className={isWon ? 'stroke-emerald-400' : wrongGuessesCount >= 6 ? 'stroke-rose-400' : 'stroke-indigo-400'}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* 5. Left Leg */}
        {wrongGuessesCount >= 5 && (
          <line
            x1="160"
            y1="170"
            x2="135"
            y2="215"
            className={isWon ? 'stroke-emerald-400' : wrongGuessesCount >= 6 ? 'stroke-rose-400' : 'stroke-indigo-400'}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}

        {/* 6. Right Leg */}
        {wrongGuessesCount >= 6 && (
          <line
            x1="160"
            y1="170"
            x2="185"
            y2="215"
            className={wrongGuessesCount >= 6 ? 'stroke-rose-400' : 'stroke-indigo-400'}
            strokeWidth="4"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};
