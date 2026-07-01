/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          hover: '#4338ca',
          light: '#ede9fe',
          dark: '#3730a3',
        },
        success: { DEFAULT: '#16a34a', light: '#dcfce7', dark: '#15803d' },
        warning: { DEFAULT: '#d97706', light: '#fef3c7', dark: '#b45309' },
        danger:  { DEFAULT: '#dc2626', light: '#fee2e2', dark: '#b91c1c' },
        surface: '#ffffff',
        muted:   '#f9fafb',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};