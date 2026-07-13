/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Deep navy — the "reading room" ink color used for the sidebar,
        // headings, and primary actions.
        navy: {
          DEFAULT: '#1B2A4A',
          dark: '#111B30',
          light: '#2C3E63',
        },
        // Brass/gold — evokes card-catalog label holders and stamped due
        // date ink; used sparingly as the single accent color.
        brass: {
          DEFAULT: '#B8860B',
          light: '#D4A537',
          dark: '#8B6508',
        },
        // Parchment — warm paper background instead of stark white.
        parchment: {
          DEFAULT: '#F8F6F0',
          dark: '#EFEAE0',
        },
        sage: { DEFAULT: '#4C7A5D', light: '#E4EEE7' },
        amber: { DEFAULT: '#B8730B', light: '#FBF0DE' },
        rust: { DEFAULT: '#AE4634', light: '#F7E5E1' },
      },
      fontFamily: {
        serif: ['"Lora"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,42,74,0.06), 0 4px 12px rgba(27,42,74,0.06)',
      },
    },
  },
  plugins: [],
};
