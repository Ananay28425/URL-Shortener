module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F19",
        primary: "#6366F1",
        violet: "#8B5CF6",
        cyan: "#06B6D4",
        muted: "#64748B",
        text: "#F8FAFC"
      },
      borderRadius: { "2xl": "1rem", "3xl": "1.5rem" },
      boxShadow: {
        soft: "0 8px 30px rgba(10,12,20,0.6)"
      }
    }
  },
  plugins: []
}