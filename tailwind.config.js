module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'], // Optimisation du CSS non utilisé
  darkMode: false, // Peut être 'media' ou 'class' pour activer le mode sombre
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'], // Police principale
      },
      keyframes: {
        fadeInUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.5s ease-out forwards', // Animation pour fade-in vers le haut
        fadeIn: 'fadeIn 0.5s ease-out forwards', // Animation simple fade-in
      },
      lineHeight: {
        'extra-tight': '1.0', // Hauteur de ligne très serrée
        tight: '1.25', // Hauteur de ligne serrée
        snug: '1.4', // Hauteur standard
        loose: '1.6', // Hauteur pour espacement plus large
      },
      spacing: {
        'sm-gap': '0.25rem', // Petit espacement
        'md-gap': '1.2rem', // Espacement moyen
        'lg-gap': '1.3rem', // Espacement large
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'inherit', // Conserve la couleur définie globalement
            p: {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
              lineHeight: '1.4', // Par défaut pour les paragraphes
              fontSize: '1.1rem',
            },
            br: {
              lineHeight: '1.0', // Espacement serré pour les sauts de ligne
              marginBottom: '0.25rem',
            },
            ul: { //CORRESPONDS DANS LES TIRETS 
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              paddingLeft: '0.3rem',
            },
            ol: { // CORRESPONDS DANS LES TIRETS A CHIFFRES
              marginTop: '0.5rem',
              marginBottom: '0.5rem',
              paddingLeft: '0.5rem',
  
            },
            li: {
              marginBottom: '0.25rem', // Espacement entre les éléments de liste
              lineHeight: '1.4', // Hauteur de ligne par défaut pour les listes
              fontSize: '1.1rem',
            },
            h1: {
              fontSize: '1.875rem', // Taille pour les titres h1
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