/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '16px',
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF5EC',
          100: '#FFE8D4',
          200: '#FFD1A9',
          300: '#FFB87A',
          400: '#FFA254',
          500: '#FF8C42',
          600: '#F57A2E',
          700: '#E6671F',
          800: '#CC5515',
          900: '#A94410',
        },
        secondary: {
          50: '#EFFBF1',
          100: '#D7F5DB',
          200: '#B4ECBC',
          300: '#8DDF9A',
          400: '#6BCB77',
          500: '#4EB860',
          600: '#3A9A4D',
          700: '#2E7B3E',
          800: '#256133',
          900: '#1E4D29',
        },
        warm: {
          50: '#FFFAF3',
          100: '#FFF3E6',
          200: '#FFE8CC',
          300: '#FFD9AA',
          400: '#FFC780',
          500: '#FFB355',
        },
        neutral: {
          50: '#FAFAF8',
          100: '#F5F5F2',
          200: '#E8E8E3',
          300: '#D4D4CC',
          400: '#A3A39B',
          500: '#73736D',
          600: '#52524E',
          700: '#40403C',
          800: '#262624',
          900: '#171716',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', '-apple-system', 'sans-serif'],
        rounded: ['"PingFang SC"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(255, 140, 66, 0.1)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.06)',
        'float': '0 12px 40px rgba(0, 0, 0, 0.1)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-soft': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
