/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
  	extend: {
  		// Largeur du contenu du site public : 1400 px utiles + 2 × 24 px de
  		// marge latérale (px-6). À utiliser sur tous les conteneurs de section.
  		maxWidth: {
  			site: 'calc(1400px + 3rem)',
  			// Longueur de ligne confortable : 65–75 caractères.
  			measure: '68ch',
  			'measure-narrow': '56ch'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			heading: ['var(--font-heading)'],
  			body: ['var(--font-body)'],
  			display: ['var(--font-display)'],
  			hand: ['var(--font-hand)'],
  			mono: ['var(--font-mono)']
  		},
  		// Échelle typographique Major Third (1.25), base 16 px. Chaque token
  		// porte sa graisse, son interlignage et son interlettrage : utiliser
  		// `text-h2` plutôt que `text-[28px] font-bold leading-tight` garantit
  		// que les trois restent solidaires. Les tailles suivent les variables
  		// CSS, donc la réduction mobile (<768px) s'applique automatiquement.
  		fontSize: {
  			display: ['var(--text-display)', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '800' }],
  			hero: ['var(--text-hero)', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '800' }],
  			h1: ['var(--text-h1)', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
  			'h2-lg': ['var(--text-h2-lg)', { lineHeight: '1.18', letterSpacing: '-0.01em', fontWeight: '700' }],
  			h2: ['var(--text-h2)', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '700' }],
  			h3: ['var(--text-h3)', { lineHeight: '1.3', fontWeight: '600' }],
  			h4: ['var(--text-h4)', { lineHeight: '1.35', fontWeight: '600' }],
  			h5: ['var(--text-h5)', { lineHeight: '1.4', fontWeight: '600' }],
  			'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
  			'body-base': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
  			'body-sm': ['0.875rem', { lineHeight: '1.4', fontWeight: '400' }],
  			caption: ['0.75rem', { lineHeight: '1.33', fontWeight: '400' }],
  			cta: ['1rem', { lineHeight: '1', fontWeight: '600' }]
  		},
  		// Mensurations d'interface : hauteurs de contrôles, rayons, gouttières.
  		// Tout est multiple de 4 px, les valeurs principales de 8 px.
  		// `h-screen` & co. divisent par le zoom grands écrans (voir
  		// `--page-zoom` dans index.css), sinon ils dépassent la fenêtre.
  		height: { screen: 'var(--screen-h)' },
  		minHeight: { screen: 'var(--screen-h)' },
  		maxHeight: { screen: 'var(--screen-h)' },
  		spacing: {
  			'control-sm': '36px',
  			control: '44px',
  			'control-lg': '52px',
  			'control-xl': '60px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
