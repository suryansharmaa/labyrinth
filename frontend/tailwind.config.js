export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Space Grotesk", "sans-serif"],
      },
      boxShadow: {
        neo: "8px 8px 0px #000",
        "neo-sm": "6px 6px 0px #000",
      },
      colors: {
        "neo-yellow": "#fcf951",
        "neo-purple": "#c464ff",
        "neo-cyan": "#00e5ff",
        "neo-pink": "#ff5c8d",
        "neo-green": "#b2ff59",
      },
    },
  },
  plugins: [],
};
