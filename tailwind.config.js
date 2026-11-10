/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep military background
        bg: {
          primary: '#07110C',
          secondary: '#0B1811',
          card: '#102219',
          elevated: '#172D20',
        },
        // Глубокий хвойный фон и полевой оливковый акцент
        accent: {
          DEFAULT: '#78964F',
          light: '#9BB96A',
          dark: '#526D38',
          muted: '#3B512A',
        },
        // Text
        text: {
          primary: '#EEF2E8',
          secondary: '#AAB8A4',
          muted: '#718173',
        },
        // Borders
        border: {
          DEFAULT: '#203B2A',
          light: '#31533A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 8px 28px -10px rgba(0, 0, 0, 0.65)',
        'glow': '0 0 24px -6px rgba(120, 150, 79, 0.38)',
      }
    },
  },
  plugins: [],
}
