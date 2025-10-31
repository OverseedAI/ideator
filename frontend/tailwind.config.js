/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        surface: '#FFFFFF',
        primary: {
          DEFAULT: '#1E293B',
          dark: '#0F172A',
        },
        secondary: '#334155',
        accent: '#0F172A',
        border: '#E2E8F0',
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
        },
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.04)',
        card: '0 2px 8px 0 rgba(15, 23, 42, 0.08)',
        elevated: '0 4px 16px 0 rgba(15, 23, 42, 0.12)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Inter',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
