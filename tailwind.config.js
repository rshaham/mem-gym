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
        // Module colors
        'detail-hunter': '#5856D6',
        'echo-chamber': '#FF9500',
        'reverse-recall': '#34C759',
        'dual-n-back': '#007AFF',
        // Accent colors
        'accent-primary': '#007AFF',
        'accent-success': '#34C759',
        'accent-warning': '#FF9500',
        'accent-error': '#FF3B30',
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
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '250ms',
        'slow': '350ms',
      },
    },
  },
  plugins: [],
};
