/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        surface: "#0f172a",
        panel: "#111827",
        accent: "#7c3aed",
        accent2: "#3b82f6",
        card: "#1f2937"
      },
      boxShadow: {
        soft: "0 8px 24px rgba(0,0,0,.25)",
      },
      borderRadius: {
        xl2: "1.25rem",
      }
    },
  },
  plugins: [],
}
