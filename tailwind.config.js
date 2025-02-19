/** @type {import('tailwindcss').Config} */
module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Optimisation du CSS non utilisé
  darkMode: false, // Peut être 'media' ou 'class' pour activer le mode sombre
  theme: {
    extend: {
      fontSize: {
        'custom-phone': '1.1rem', // Taille pour téléphone ou petits écrans avec grande police
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'], // Police principale
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: { // ✅ Animation pour le ticker
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.5s ease-out forwards', // Animation fade-in vers le haut
        fadeIn: 'fadeIn 0.5s ease-out forwards', // Animation simple fade-in
        marquee: 'marquee 25s linear infinite', // ✅ Animation du ticker
      },
      lineHeight: {
        'extra-tight': '1.0',
        tight: '1.25',
        snug: '1.4',
        loose: '1.6',
      },
      spacing: {
        'sm-gap': '0.25rem',
        'md-gap': '1.2rem',
        'lg-gap': '1.3rem',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'inherit', // Conserve la couleur définie globalement
            p: {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
              lineHeight: '1.4',
              fontSize: '0.95rem',
              '@screen lg': { fontSize: '1.1rem' },
            },
            br: {
              lineHeight: '1.0',
              marginBottom: '0.25rem',
            },
            ul: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              paddingLeft: '0.3rem',
              '& li::marker': {
                color: '#011F5B',
                fontSize: '0.98rem',
                '@screen lg': { fontSize: '1.1rem' },
              },
            },
            ol: {
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              paddingLeft: '0.5rem',
              '& li::marker': {
                color: '#011F5B',
                fontSize: '0.98rem',
                '@screen lg': { fontSize: '1.1rem' },
              },
            },
            li: {
              marginBottom: '0.25rem',
              lineHeight: '1.4',
              fontSize: '0.98rem',
              '@screen lg': { fontSize: '1.1rem' },
            },
            h1: {
              fontSize: '1.875rem',
              marginTop: '1rem',
              marginBottom: '0.5rem',
              lineHeight: '1.2',
            },
            h2: {
              fontSize: '1.5rem',
              marginTop: '0.75rem',
              marginBottom: '0.5rem',
              lineHeight: '1.25',
            },
            h3: {
              fontSize: '1.25rem',
              marginTop: '0.5rem',
              marginBottom: '0.25rem',
              lineHeight: '1.3',
            },
            strong: {
              marginTop: '0.5rem',
              marginBottom: '0rem',
              fontSize: '0.98rem',
              '@screen lg': { fontSize: '1.1rem' },
            },
          },
        },
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // Plugin pour des styles de texte avancés
  ],
};
