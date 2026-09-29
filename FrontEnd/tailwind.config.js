/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#F8FAFC',
          dark: '#0A0E17',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#111726',
          mutedLight: '#F1F5F9',
          mutedDark: '#172033',
          borderLight: '#E2E8F0',
          borderDark: '#222F46',
          borderDarkHigh: '#324463',
          // Card aliases — used by PageStateWrapper
          cardLight: '#FFFFFF',
          cardDark: '#111726',
        },
        cjack: {
          primary: '#1D4ED8',      // Medical Cobalt Blue
          primaryHover: '#1E40AF',
          accent: '#0284C7',       // Tech Cyan
        },
        // Strict Semantic Status System
        semantic: {
          normal: '#059669',
          normalBgLight: '#ECFDF5',
          normalBgDark: 'rgba(5, 150, 105, 0.15)',
          warning: '#D97706',
          warningBgLight: '#FFFBEB',
          warningBgDark: 'rgba(217, 119, 6, 0.15)',
          critical: '#DC2626',
          criticalBgLight: '#FEF2F2',
          criticalBgDark: 'rgba(220, 38, 38, 0.18)',
          offline: '#64748B',
          offlineBgLight: '#F1F5F9',
          offlineBgDark: 'rgba(100, 116, 139, 0.15)',
          unknown: '#7C3AED',
          unknownBgLight: '#F5F3FF',
          unknownBgDark: 'rgba(124, 58, 237, 0.15)',
          simulated: '#0284C7',
          simulatedBgLight: '#F0F9FF',
          simulatedBgDark: 'rgba(2, 132, 199, 0.15)',
        },
        // Status shorthand aliases — used by PageStateWrapper prose
        status: {
          emergency: '#DC2626',
          warning: '#D97706',
          normal: '#059669',
          offline: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-urgent': 'pulse 0.9s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}

