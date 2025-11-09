/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46'
        },
        background: '#0b1220',
        card: '#0f1724',
        text: {
          high: '#e6eef8',
          medium: '#cbd5e1'
        },
        muted: '#94a3b8',
        border: '#1f2937',
        inputBg: '#0f1724',
        // Also expose nested variant for background.base if referenced
        'background-base': '#0b1220'
      }
    }
  }
}