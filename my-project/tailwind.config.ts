import type { Config } from "tailwindcss";
const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette");

const config: Config = {
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			blog: 'var(--neutral-100)',
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
  			}
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					strong: {
  						color: '#3b82f6'
  					},
  					code: {
  						color: '#10b981'
  					}
  				}
  			}
  		},
  		animation: {
  			shimmer: 'shimmer 2s linear infinite',
  			'pulse-dot': 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  			'fade-in': 'fadeIn 0.5s ease-in-out',
  			'slide-up': 'slideUp 0.5s ease-out',
  			'scale-in': 'scaleIn 0.3s ease-out',
			'gradient': 'gradient 6s ease infinite',
  		},
		keyframes: {
			shimmer: {
				'0%': {
					transform: 'translateX(-100%)'
				},
				'100%': {
					transform: 'translateX(100%)'
				}
			},
			'pulse-dot': {
				'0%, 100%': {
					opacity: '1'
				},
				'50%': {
					opacity: '0.5'
				}
			},
			fadeIn: {
				'0%': {
					opacity: '0'
				},
				'100%': {
					opacity: '1'
				}
			},
			slideUp: {
				'0%': {
					transform: 'translateY(20px)',
					opacity: '0'
				},
				'100%': {
					transform: 'translateY(0)',
					opacity: '1'
				}
			},
			scaleIn: {
				'0%': {
					transform: 'scale(0.95)',
					opacity: '0'
				},
				'100%': {
					transform: 'scale(1)',
					opacity: '1'
				}
			},
			gradient: {
				'0%, 100%': { backgroundPosition: '0% 50%' },
				'50%': { backgroundPosition: '100% 50%' },
			}
		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem',
  			'144': '36rem'
  		},
  		fontSize: {
  			'2xs': '0.625rem',
  			'3xs': '0.5rem'
  		},
  		borderRadius: {
  			'4xl': '2rem',
  			'5xl': '2.5rem',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		backdropBlur: {
  			xs: '2px'
  		},
  		lineHeight: {
  			'12': '3rem',
  			'14': '3.5rem'
  		},
  		maxWidth: {
  			'8xl': '88rem',
  			'9xl': '96rem'
  		},
  		zIndex: {
  			'60': '60',
  			'70': '70',
  			'80': '80',
  			'90': '90',
  			'100': '100'
  		},
  		transitionTimingFunction: {
  			'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  			'smooth': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
  		},
  		boxShadow: {
  			'inner-lg': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.1)',
  			'glow': '0 0 20px rgb(59 130 246 / 0.5)',
  			'glow-lg': '0 0 40px rgb(59 130 246 / 0.3)'
  		},
  		scale: {
  			'102': '1.02',
  			'103': '1.03'
  		}
  	}
  },
  plugins: [
    require("@tailwindcss/typography"),
    addVariablesForColors,
    // Custom plugin for component utilities
    function({ addUtilities }: any) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        '.mask-gradient-to-b': {
          'mask-image': 'linear-gradient(to bottom, black, transparent)',
        },
        '.mask-gradient-to-t': {
          'mask-image': 'linear-gradient(to top, black, transparent)',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1',
            'border-radius': '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#94a3b8',
          },
        },
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.transform-style-3d': {
          'transform-style': 'preserve-3d',
        },
        '.backface-hidden': {
          'backface-visibility': 'hidden',
        },
      }
      
      addUtilities(newUtilities)
    },
      require("tailwindcss-animate")
],
} satisfies Config;

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

export default config;