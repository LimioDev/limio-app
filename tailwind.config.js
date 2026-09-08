/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        marca: {
          50: "#EFF7F5",
          100: "#D7ECE7",
          200: "#B0D9D0",
          300: "#85C4B7",
          400: "#57AA9A",
          500: "#1F7A6B",
          600: "#1B6A5D",
          700: "#16564C",
          800: "#11413B",
          900: "#0C2E2A",
        },
        estado: {
          aguardando: "#F59E0B",
          combinado: "#3B82F6",
          andamento: "#6366F1",
          validacao: "#A855F7",
          contestacao: "#EF4444",
          concluido: "#22C55E",
          cancelado: "#6B7280",
          expirado: "#B45309",
        },
        perigo: "#EF4444",
        alerta: "#F59E0B",
        sucesso: "#22C55E",
        info: "#3B82F6",
        tinta: {
          DEFAULT: "#1C1C1E",
          suave: "#52525B",
          fraco: "#A1A1AA",
        },
        borda: "#E4E4E7",
        fundo: "#FFFFFF",
      },
      fontSize: {
        micro: ["11px", { lineHeight: "14px" }],
        rotulo: ["13px", { lineHeight: "16px" }],
        corpo: ["15px", { lineHeight: "20px" }],
        titulo: ["20px", { lineHeight: "26px" }],
        display: ["28px", { lineHeight: "34px" }],
      },
      borderRadius: {
        card: "16px",
        campo: "12px",
      },
      spacing: {
        toque: "44px",
      },
    },
  },
  plugins: [],
};
