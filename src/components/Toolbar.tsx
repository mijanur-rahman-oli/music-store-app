import React from 'react';
import { Shuffle, Table, Grid } from 'lucide-react';
import { AppState } from '../types';

interface ToolbarProps {
  state: AppState;
  onStateChange: (newState: Partial<AppState>) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ state, onStateChange }) => {
  const generateRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
    onStateChange({ userSeed: randomSeed });
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg pt-16">
      <div className="container mx-auto px-4 py-3 gap-10">
        <div className="flex flex-wrap items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <div className="text-2xl">🎵</div>
            <h1 className="text-xl font-bold text-white hidden sm:block">Music Store</h1>
          </div>

          <div className="flex-1 flex flex-wrap items-center gap-3">
            {/* Language Dropdown */}
            <select
              value={state.locale}
              onChange={(e) => onStateChange({ locale: e.target.value })}
              className="px-3 py-2 rounded-lg bg-white/90 backdrop-blur-sm border border-white/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
            >
              <option value="en-US">🇺🇸 English (USA)</option>
              <option value="de">🇩🇪 Deutsch</option>
              <option value="uk">🇺🇦 Українська</option>
            </select>

            {/* Seed Input */}
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
              <input
                type="text"
                value={state.userSeed}
                onChange={(e) => onStateChange({ userSeed: e.target.value })}
                placeholder="Seed (64-bit)"
                className="bg-transparent focus:outline-none text-sm w-32 sm:w-40"
              />
              <button
                onClick={generateRandomSeed}
                className="p-1 hover:bg-purple-100 rounded transition-colors"
                title="Generate Random Seed"
              >
                <Shuffle size={18} />
              </button>
            </div>

            {/* Average Likes Slider */}
            <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
              <span className="text-sm whitespace-nowrap">Avg Likes:</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={state.averageLikes}
                onChange={(e) => onStateChange({ averageLikes: parseFloat(e.target.value) })}
                className="w-24 sm:w-32"
              />
              <span className="text-sm font-semibold w-8">{state.averageLikes.toFixed(1)}</span>
            </div>

            {/* View Mode Toggle */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => onStateChange({ viewMode: 'table' })}
                className={`p-2 rounded-lg transition-all ${
                  state.viewMode === 'table'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'bg-white/50 text-white hover:bg-white/70'
                }`}
                title="Table View"
              >
                <Table size={20} />
              </button>
              <button
                onClick={() => onStateChange({ viewMode: 'gallery' })}
                className={`p-2 rounded-lg transition-all ${
                  state.viewMode === 'gallery'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'bg-white/50 text-white hover:bg-white/70'
                }`}
                title="Gallery View"
              >
                <Grid size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;