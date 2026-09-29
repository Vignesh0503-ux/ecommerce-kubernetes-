/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14161a',
        paper: '#faf9f7',
        brand: {
          50: '#f2f7f4',
          100: '#dcece2',
          200: '#b8d9c6',
          300: '#8fc1a4',
          400: '#5fa17e',
          500: '#3f8264',
          600: '#2f6750',
          700: '#275341',
          800: '#214436',
          900: '#1c392e',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,22,26,0.04), 0 4px 16px rgba(20,22,26,0.06)',
      },
    },
  },
  plugins: [],
}
