import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, Sparkles, HelpCircle, ShieldAlert, Play } from 'lucide-react';

interface WordSetupProps {
  player1Name: string;
  player2Name: string;
  onStartGame: (word: string, category: string, maxMistakes: number) => void;
}

const PRESET_SUGGESTIONS = [
  { word: 'PYTHAGORAS', category: 'Mathematics' },
  { word: 'CLOUDFLARE', category: 'Technology' },
  { word: 'SUPERHERO', category: 'Pop Culture' },
  { word: 'ASTRONAUT', category: 'Space' },
  { word: 'CHOCOLATE', category: 'Food & Drink' },
  { word: 'AVENGER', category: 'Movies' },
];

export const WordSetup: React.FC<WordSetupProps> = ({
  player1Name,
  player2Name,
  onStartGame,
}) => {
  const [word, setWord] = useState('');
  const [category, setCategory] = useState('');
  const [maxMistakes, setMaxMistakes] = useState(6);
  const [showSecret, setShowSecret] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = word.trim().toUpperCase();

    if (!cleaned) {
      setError('Please enter a secret word or phrase.');
      return;
    }

    if (!/^[A-Z\s\-'!]+$/i.test(cleaned)) {
      setError('Only English alphabetic characters and basic punctuation are allowed.');
      return;
    }

    setError('');
    onStartGame(cleaned, category.trim(), maxMistakes);
  };

  const handleSelectPreset = (preset: { word: string; category: string }) => {
    setWord(preset.word);
    setCategory(preset.category);
    setError('');
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">
            Step 1: Secret Setup
          </span>
          <h2 className="font-display text-2xl font-bold text-white">
            {player1Name}'s Turn to Set a Word
          </h2>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs sm:text-sm text-indigo-200/90 leading-relaxed">
          <strong>Pass keyboard to {player1Name}!</strong> {player2Name} should look away while the secret word is being entered.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Secret Word Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Secret Word or Phrase *
          </label>
          <div className="relative">
            <input
              type={showSecret ? 'text' : 'password'}
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="e.g. ALGORITHM"
              className="w-full px-4 py-3.5 pr-12 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono tracking-widest text-lg uppercase transition-all"
              autoFocus
              maxLength={30}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-200 transition-colors"
              title={showSecret ? 'Hide word' : 'Show word'}
            >
              {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {error && <p className="mt-2 text-xs font-medium text-rose-400">{error}</p>}
        </div>

        {/* Category / Hint Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" /> Category / Hint (Optional)
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Science, Movie, 80s Rock Band"
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm transition-all"
            maxLength={40}
          />
        </div>

        {/* Max Mistakes Allowed */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Max Incorrect Guesses Allowed
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[4, 6, 8].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setMaxMistakes(num)}
                className={`py-2.5 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  maxMistakes === num
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {num} Lives {num === 6 ? '(Standard)' : num === 4 ? '(Hard)' : '(Easy)'}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Ideas / Presets */}
        <div>
          <span className="text-xs text-slate-400 flex items-center gap-1 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Need inspiration? Try a preset:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_SUGGESTIONS.map((preset) => (
              <button
                key={preset.word}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs border border-slate-700/50 transition-colors"
              >
                {preset.word} <span className="text-slate-500">({preset.category})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <button
          type="submit"
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-display font-bold text-lg hover:from-indigo-600 hover:to-purple-700 shadow-xl shadow-indigo-600/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-4"
        >
          <Play className="w-5 h-5 fill-current" />
          Lock Word & Start Guessing
        </button>
      </form>
    </div>
  );
};
