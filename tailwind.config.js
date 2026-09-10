/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          500: '#4168DD', // Official COMESA Blue
          600: '#3352C4',
          700: '#273EA3',
        },
        comesaGreen: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#34C64A', // Official COMESA Green
          600: '#2AA53B',
          700: '#21852F',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#0B0F17',
          subtleLight: '#F8FAFC',
          subtleDark: '#141B2D',
          borderLight: '#E2E8F0',
          borderDark: '#1E293B',
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
