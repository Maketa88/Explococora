/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        nunito: ["Nunito", "sans-serif"],
      },
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
        }
      },
      animation: {
        'bounce-in': 'bounce-in 0.8s ease-out',
        gradient: "gradientBG 6s ease infinite"
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
