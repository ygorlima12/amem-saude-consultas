/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores principais do sistema (baseadas no design original)
        primary: {
          DEFAULT: '#0DB5A6', // Turquesa principal
          hover: '#0a9d8f',
          light: 'rgba(13, 181, 166, 0.1)',
          50: '#e0f7f5',
          100: '#b3ebe6',
          200: '#80ded6',
          300: '#4dd1c6',
          400: '#26c7ba',
          500: '#0DB5A6',
          600: '#0ba598',
          700: '#099287',
          800: '#078076',
          900: '#036057',
        },
        secondary: {
          DEFAULT: '#183157', // Azul escuro
          dark: '#0e1f3a',
          darker: '#0e1f3a',
          light: 'rgba(24, 49, 87, 0.1)',
          50: '#e8eaf0',
          100: '#c6cbd9',
          200: '#a0a9c0',
          300: '#7a87a7',
          400: '#5e6e94',
          500: '#415581',
          600: '#3b4e79',
          700: '#32446e',
          800: '#2a3b64',
          900: '#183157',
        },
        success: {
          DEFAULT: '#48bb78',
          light: 'rgba(72, 187, 120, 0.1)',
          dark: '#1e7e34',
          50: '#f0fdf4',
          500: '#48bb78',
          600: '#28a745',
          700: '#218838',
        },
        warning: {
          DEFAULT: '#ed8936',
          light: 'rgba(237, 137, 54, 0.1)',
          dark: '#856404',
          50: '#fff3cd',
          500: '#ffc107',
          600: '#e0a800',
        },
        danger: {
          DEFAULT: '#f56565',
          light: 'rgba(245, 101, 101, 0.1)',
          dark: '#b21f2d',
          50: '#fee',
          500: '#dc3545',
          600: '#c82333',
        },
        info: {
          DEFAULT: '#4299e1',
          light: 'rgba(66, 153, 225, 0.1)',
          dark: '#117a8b',
          50: '#e7f3ff',
          500: '#17a2b8',
          600: '#138496',
        },
        neutral: {
          DEFAULT: '#6c757d',
          light: 'rgba(108, 117, 125, 0.12)',
          dark: '#495057',
        },
        // Cores de texto
        text: {
          primary: '#2c3e50',
          secondary: '#6c757d',
          tertiary: '#4a5568',
          dark: '#2d3748',
          light: '#718096',
        },
        // Backgrounds
        bg: {
          DEFAULT: '#f8f9fa',
          secondary: '#f5f7fa',
          tertiary: '#fafbfc',
          gray: '#f7fafc',
        },
        // Borders
        border: {
          DEFAULT: '#e0e0e0',
          light: '#f0f0f0',
          gray: '#e2e8f0',
          dark: '#eaeaea',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'card-md': '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'card-hover-sm': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'header': '0 1px 3px rgba(0, 0, 0, 0.05)',
        'sidebar': '2px 0 8px rgba(0, 0, 0, 0.08)',
        'button': '0 2px 8px rgba(13, 181, 166, 0.2)',
        'button-hover': '0 4px 12px rgba(13, 181, 166, 0.3)',
        'button-sm': '0 2px 4px rgba(0, 0, 0, 0.1)',
        'modal': '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.08)',
        'location': '0 4px 12px rgba(13, 181, 166, 0.15)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        'card': '16px',
        'card-sm': '12px',
        'modal': '20px',
        'button': '10px',
        'input': '10px',
        'badge': '999px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #183157 0%, #0DB5A6 100%)',
        'gradient-sidebar': 'linear-gradient(180deg, #183157 0%, #0e1f3a 100%)',
        'gradient-admin': 'linear-gradient(180deg, #183157 0%, #0e1f3a 100%)',
        'gradient-avatar': 'linear-gradient(135deg, #0DB5A6, #183157)',
        'gradient-danger': 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        'gradient-success': 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
        'gradient-info': 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
        'gradient-warning': 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
        'gradient-stat-border': 'linear-gradient(180deg, #0DB5A6, #183157)',
      },
    },
  },
  plugins: [],
}
