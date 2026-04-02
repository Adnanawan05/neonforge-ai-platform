import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05040A',
          900: '#0B0814',
          800: '#120D22',
        },
        neon: {
          cyan: '#4EF0FF',
          blue: '#5B6CFF',
          violet: '#A855F7',
          pink: '#FF4FD8',
          lime: '#3DFFB5',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(78,240,255,0.25), 0 18px 70px rgba(91,108,255,0.18)',
        glowHard: '0 0 0 1px rgba(168,85,247,0.28), 0 0 22px rgba(78,240,255,0.35), 0 30px 120px rgba(255,79,216,0.12)',
      },
      backdropBlur: {
        glass: '18px',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-30%)' },
          '100%': { transform: 'translateX(130%)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
