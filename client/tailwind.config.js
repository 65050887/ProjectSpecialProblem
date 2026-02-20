/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F16323",
      },
      fontFamily: {
        sans: ['"LINE Seed Sans TH"', "system-ui", "sans-serif"],
        
        en: ['"LINE Seed Sans EN"', "system-ui" ,"sans-serif"],
        th: ['"LINE Seed Sans TH"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};