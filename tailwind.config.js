/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1B2430',
          light: '#252F3D',
          lighter: '#334155',
        },
        paper: '#F7F5F0',
        amber: {
          DEFAULT: '#FFB020',
          dark: '#D6900F',
        },
        teal: {
          DEFAULT: '#0F6A63',
          light: '#12857C',
        },
        alert: '#D64545',
        slate: {
          muted: '#6B7280',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'ticket-notch': 'radial-gradient(circle at 0 50%, transparent 8px, #F7F5F0 8.5px), radial-gradient(circle at 100% 50%, transparent 8px, #F7F5F0 8.5px)',
      },
    },
  },
  plugins: [],
};
