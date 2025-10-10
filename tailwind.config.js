/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // --- NEW VARIABLE-BASED SYSTEM (FOR CUSTOM THEME) ---
        background: 'hsl(var(--color-background) / <alpha-value>)',
        surface: 'hsl(var(--color-surface) / <alpha-value>)',
        accent: {
          DEFAULT: 'hsl(var(--color-accent) / <alpha-value>)',
          secondary: 'hsl(var(--color-accent-secondary) / <alpha-value>)',
          muted: 'hsl(var(--color-accent-muted) / <alpha-value>)',
        },
        text: {
          primary: 'hsl(var(--color-text-primary) / <alpha-value>)',
          secondary: 'hsl(var(--color-text-secondary) / <alpha-value>)',
        },
        ui: {
           border: 'hsl(var(--color-border) / <alpha-value>)'
        },

        // --- DIRECT COLOR DEFINITIONS ---
        'dark-bg': '#141217',
        'dark-card': '#1A1C28',
        'dark-border': 'rgba(174, 160, 248, 0.15)',
        'dark-text': '#EAE0F8',
        'dark-text-secondary': '#A998BC',

        'light-bg': '#F9FAFB',
        'light-card': '#FFFFFF',
        'light-border': '#E5E7EB',
        'light-text': '#1F2937',
        'light-text-secondary': '#6B7280',

        'accent-primary': '#EE7200',
        'accent-secondary': '#FE5000',

        // --- NEW COLORS FOR SKELETON LOADER ---
        'surface-muted': 'hsl(var(--color-border) / 0.5)',
        'shimmer-from': 'transparent',
        'shimmer-via': 'hsl(var(--color-surface) / 0.5)',
        'shimmer-to': 'transparent',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-accent': '0 0 15px 0px hsl(var(--color-accent) / 0.5)',
      },
      saturate: {
        150: '1.5'
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'infinite-scroll': 'infinite-scroll 35s linear infinite',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
        // --- NEW ANIMATION FOR SKELETONS ---
        shimmer: 'shimmer 2.5s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        'infinite-scroll': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .7 },
        },
        glow: {
          'from': { textShadow: '0 0 4px hsl(var(--color-accent))' },
          'to': { textShadow: '0 0 10px hsl(var(--color-accent)), 0 0 14px hsl(var(--color-accent-secondary))' },
        },
        // --- NEW KEYFRAMES FOR SKELETONS ---
        shimmer: {
            '0%': { transform: 'translateX(-100%)' },
            '100%': { transform: 'translateX(100%)' },
        },
      },
      backgroundImage: {
          // --- NEW GRADIENT FOR SKELETONS ---
          'shimmer-gradient': 'linear-gradient(to right, var(--tw-gradient-from) 20%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 80%)',
      },
    },
  },
  plugins: [],
};