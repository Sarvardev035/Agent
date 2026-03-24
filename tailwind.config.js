module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: { DEFAULT: '#0a1628', 800: '#0f2040' },
        royal: '#1a3a6b',
        finly: { blue: '#2563eb', purple: '#7c3aed' },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'fade-up': 'pageIn 0.25s ease-out',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite',
      },
      screens: {
        xs: '375px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
      },
    },
  },
  plugins: [],
}
