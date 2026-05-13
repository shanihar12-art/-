/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F5C842',
          dark: '#A8892B',
          glow: 'rgba(212,175,55,0.15)',
        },
        emerald: {
          finance: '#10B981',
          glow: 'rgba(16,185,129,0.15)',
        },
        electric: {
          blue: '#0EA5E9',
          glow: 'rgba(14,165,233,0.15)',
        },
        bg: {
          primary: '#080B14',
          secondary: '#0D1117',
          card: 'rgba(255,255,255,0.03)',
          hover: 'rgba(255,255,255,0.06)',
        },
        border: {
          subtle: 'rgba(255,255,255,0.06)',
          medium: 'rgba(255,255,255,0.10)',
          gold: 'rgba(212,175,55,0.25)',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          muted: '#475569',
        }
      },
      fontFamily: {
        sans: ['Heebo', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
        'gold-glow': '0 0 20px rgba(212,175,55,0.25), 0 0 60px rgba(212,175,55,0.08)',
        'blue-glow': '0 0 20px rgba(14,165,233,0.25), 0 0 60px rgba(14,165,233,0.08)',
        'emerald-glow': '0 0 20px rgba(16,185,129,0.25), 0 0 60px rgba(16,185,129,0.08)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.4)',
      },
      backdropBlur: {
        'glass': '20px',
        'heavy': '40px',
      },
      animation: {
        'float': 'float 8s ease-in-out infinite',
        'float-slow': 'float 12s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'spin-slow': 'spin 20s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) translateX(0px)' },
          '33%': { transform: 'translateY(-20px) translateX(10px)' },
          '66%': { transform: 'translateY(10px) translateX(-15px)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(212,175,55,0.2)' },
          '50%': { boxShadow: '0 0 40px rgba(212,175,55,0.5), 0 0 80px rgba(212,175,55,0.2)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.4 },
          '50%': { opacity: 0.8 },
        }
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #F5C842 50%, #A8892B 100%)',
        'gradient-dark': 'linear-gradient(135deg, #080B14 0%, #0D1117 50%, #080B14 100%)',
      }
    },
  },
  plugins: [],
}
