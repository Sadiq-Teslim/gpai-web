/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1E88E5',   // Tech Blue
        secondary: '#43A047', // Fresh Green
        accent: '#FFC107',    // Amber/Yellow
        'dark-text': '#212121',
        'light-text': '#757575',
        background: '#F5F5F5',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}