/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Module colors with variants
        'dual-n-back': {
          DEFAULT: '#3B82F6',
          light: '#DBEAFE',
          dark: '#1E40AF',
        },
        'echo-chamber': {
          DEFAULT: '#F59E0B',
          light: '#FEF3C7',
          dark: '#B45309',
        },
        'detail-hunter': {
          DEFAULT: '#8B5CF6',
          light: '#EDE9FE',
          dark: '#5B21B6',
        },
        'reverse-recall': {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
          dark: '#047857',
        },
        // Semantic colors
        'accent-primary': '#3B82F6',
        'accent-success': '#059669',
        'accent-warning': '#D97706',
        'accent-error': '#DC2626',
        // Celebration
        'gold': '#FBBF24',
        'gold-dark': '#D97706',
      },
      spacing: {
        'touch': '44px',
        'touch-comfortable': '56px',
      },
      minHeight: {
        'touch': '44px',
        'touch-comfortable': '56px',
      },
      minWidth: {
        'touch': '44px',
        'touch-comfortable': '56px',
      },
      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
      keyframes: {
        // Entrance animations
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Celebration animations
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(59, 130, 246, 0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        // Feedback animations
        'flash-success': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(5, 150, 105, 0.15)' },
        },
        'flash-error': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(220, 38, 38, 0.15)' },
        },
        // Number animations
        'count-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Confetti particle
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.5s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'flash-success': 'flash-success 0.4s ease-out',
        'flash-error': 'flash-error 0.4s ease-out',
        'count-up': 'count-up 0.4s ease-out',
        'confetti': 'confetti 3s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
