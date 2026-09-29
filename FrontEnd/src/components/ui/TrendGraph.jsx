import React from 'react';

/**
 * TrendGraph Component
 * Medical-grade simulated physiological waveform visualizer.
 * Clearly watermarked as SIMULATED DATA.
 */
export const TrendGraph = ({
  type = 'ecg', // 'ecg', 'ppg', 'respiration', 'depth'
  status = 'NORMAL',
  height = 48,
  color = '#10B981',
  className = ''
}) => {
  const isArrest = status === 'CRITICAL' || status === 'CARDIAC ARREST SUSPECTED';
  const strokeColor = isArrest ? '#EF4444' : color;

  // Path generators for simulated physiological signals
  const getWaveformPath = () => {
    if (type === 'ecg') {
      if (isArrest) {
        // Chaotic Ventricular Fibrillation
        return "M 0 24 Q 10 5, 20 40 T 40 10 T 60 45 T 80 15 T 100 40 T 120 8 T 140 42 T 160 14 T 180 38 T 200 12 T 220 44 T 240 16 T 260 40 T 280 10 T 300 35 L 320 24";
      }
      // Standard P-QRS-T complex repeating
      return "M 0 24 L 20 24 Q 24 20, 28 24 L 35 24 L 38 27 L 42 4 L 46 40 L 50 24 L 58 24 Q 66 16, 74 24 L 95 24 Q 99 20, 103 24 L 110 24 L 113 27 L 117 4 L 121 40 L 125 24 L 133 24 Q 141 16, 149 24 L 170 24 Q 174 20, 178 24 L 185 24 L 188 27 L 192 4 L 196 40 L 200 24 L 208 24 Q 216 16, 224 24 L 245 24 Q 249 20, 253 24 L 260 24 L 263 27 L 267 4 L 271 40 L 275 24 L 283 24 Q 291 16, 299 24 L 320 24";
    }

    if (type === 'ppg') {
      if (isArrest) {
        // Flatline pulse wave
        return "M 0 24 L 320 24";
      }
      // Photoplethysmogram pulsatile wave with dicrotic notch
      return "M 0 35 Q 15 5, 25 10 Q 30 18, 35 15 Q 45 35, 55 35 Q 70 5, 80 10 Q 85 18, 90 15 Q 100 35, 110 35 Q 125 5, 135 10 Q 140 18, 145 15 Q 155 35, 165 35 Q 180 5, 190 10 Q 195 18, 200 15 Q 210 35, 220 35 Q 235 5, 245 10 Q 250 18, 255 15 Q 265 35, 275 35 Q 290 5, 300 10 Q 305 18, 310 15 Q 315 35, 320 35";
    }

    if (type === 'respiration') {
      if (isArrest) {
        return "M 0 24 L 320 24";
      }
      // Sinusoidal breathing wave
      return "M 0 24 Q 40 4, 80 24 T 160 24 T 240 24 T 320 24";
    }

    // Default mechanical compression saw/triangle wave
    return "M 0 40 L 20 8 L 40 40 L 60 8 L 80 40 L 100 8 L 120 40 L 140 8 L 160 40 L 180 8 L 200 40 L 220 8 L 240 40 L 260 8 L 280 40 L 300 8 L 320 40";
  };

  return (
    <div className={`relative w-full rounded bg-slate-950 border border-slate-800/80 overflow-hidden ${className}`}>
      {/* Background medical grid */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#64748b_1px,transparent_1px)] [background-size:12px_12px]" />

      <svg
        className="w-full h-full"
        style={{ height: `${height}px` }}
        viewBox="0 0 320 48"
        preserveAspectRatio="none"
      >
        <path
          d={getWaveformPath()}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isArrest ? 'animate-pulse' : ''}
        />
      </svg>

      {/* Mandatory Prototype Simulation Watermark */}
      <div className="absolute bottom-0.5 right-1.5 text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider select-none">
        [SIMULATED SYNTHESIS]
      </div>
    </div>
  );
};

export default TrendGraph;
