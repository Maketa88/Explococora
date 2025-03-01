/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['Nunito', 'sans-serif'],
      nunito: ["Nunito", "sans-serif"],
    },
    extend: {
      colors: {
        primary: "#4361ee",
        secondary: "#4f46e5",
        dark: "#1f2937",
        light: "#f3f4f6",
        tropicalCanopy: "#17A45F", // Verde tropical profundo pero encendido
      },
      keyframes: {
        'bounce-in': {
          '0%': { 
            transform: 'translateY(-100%)',
            opacity: '0'
          },
          '60%': {
            transform: 'translateY(10%)',
            opacity: '0.8'
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1'
          }
        },
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        }
      },
      animation: {
        'bounce-in': 'bounce-in 0.8s ease-out',
        gradient: "gradientBG 6s ease infinite",
        'fade-in-down': 'fade-in-down 0.3s ease-out forwards'
      },
      gradientBG: {
        "0%": { backgroundPosition: "0% 50%" },
        "50%": { backgroundPosition: "100% 50%" },
        "100%": { backgroundPosition: "0% 50%" },
      },
    },
  },
  plugins: [],
}
