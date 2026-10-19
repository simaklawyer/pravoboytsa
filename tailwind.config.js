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
          primary: '#0B0F0C',
          secondary: '#111613',
          card: '#161C18',
          elevated: '#1C2420',
        },
        // Military emerald / khaki accent
        accent: {
          DEFAULT: '#3D8B6E',
          light: '#4FA382',
          dark: '#2E6B55',
          muted: '#2A5A48',
        },
        // Text
        text: {
          primary: '#E8EDE9',
          secondary: '#A3B0A8',
          muted: '#6B7A72',
        },
        // Borders
        border: {
          DEFAULT: '#24302A',
          light: '#2E3C34',
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
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.4)',
        'glow': '0 0 20px -4px rgba(61, 139, 110, 0.3)',
      }
    },
  },
  plugins: [],
}
