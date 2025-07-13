/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        soft: "#eaf4fb",
        card: "#ffffff",
        primary: "#00cc88",
        secondary: "#3aae68",
        accent: "#0097e6",
        warning: "#f59e0b",
        danger: "#ef4444",
        muted: "#7a7a7a",
        border: "#d8e6f4",
      },
    },
  },
  plugins: [],
}

