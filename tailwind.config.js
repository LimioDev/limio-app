/**
 * Tokens do guia "00 · Fundamentos do produto v1.1" (Figma LIMIO - PROTOTIPO REAL).
 * Cores dos componentes medidas nos recortes exportados do protótipo.
 *
 * @type {import('tailwindcss').Config}
 */
module.exports = {
  presets: [require("nativewind/preset")],
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Escala monocromática azul — base de toda a interface.
        marca: {
          50: "#E9EEFB",
          100: "#C2CEF4",
          300: "#7D9BF2",
          500: "#2159CC",
          600: "#1D4098",
          700: "#153073",
          800: "#0F1F4C",
          900: "#060B20",
        },
        // Badge de cada estado da máquina de estados do anúncio: fundo + texto.
        estado: {
          aguardando: { DEFAULT: "#E9EEFB", texto: "#1D4098" },
          combinado: { DEFAULT: "#0F1F4C", texto: "#FFFFFF" },
          andamento: { DEFAULT: "#2159CC", texto: "#FFFFFF" },
          validacao: { DEFAULT: "#FBEEDA", texto: "#7A4A11" },
          // Fora do guia: usa o par do destrutivo até ganhar badge próprio.
          contestacao: { DEFAULT: "#FBE6E4", texto: "#8C2A20" },
          concluido: { DEFAULT: "#E0F0E7", texto: "#1D5A3C" },
          cancelado: { DEFAULT: "#FBE6E4", texto: "#8C2A20" },
          expirado: { DEFAULT: "#EDF0F7", texto: "#4A5675" },
        },
        // Funcionais — uso restrito.
        perigo: { DEFAULT: "#8C2A20", fundo: "#FBE6E4", borda: "#EFCBC6" },
        alerta: { DEFAULT: "#7A4A11", fundo: "#FBEEDA" },
        sucesso: { DEFAULT: "#1D5A3C", fundo: "#E0F0E7" },
        gold: { DEFAULT: "#6B4A11", fundo: "#F6E7C4" },
        estrela: "#C79A2E",
        tinta: {
          DEFAULT: "#0B1226",
          suave: "#4A5675",
          fraco: "#7B87A4",
        },
        // `borda` separa superfícies; `borda-campo` contorna campo, chip e botão neutro.
        borda: { DEFAULT: "#E3E8F3", campo: "#D3DBEC" },
        controle: { desligado: "#D7DDEB" },
        fundo: "#F4F6FB",
        superficie: "#FFFFFF",
      },
      fontSize: {
        overline: ["10.5px", { lineHeight: "14px", letterSpacing: "0.4px" }],
        micro: ["11px", { lineHeight: "14px" }],
        rotulo: ["12.5px", { lineHeight: "16px" }],
        corpo: ["15px", { lineHeight: "21px" }],
        secao: ["19px", { lineHeight: "24px", letterSpacing: "-0.2px" }],
        titulo: ["26px", { lineHeight: "32px", letterSpacing: "-0.4px" }],
        display: ["40px", { lineHeight: "46px", letterSpacing: "-0.8px" }],
      },
      borderRadius: {
        chip: "11px",
        campo: "14px",
        card: "18px",
        destaque: "22px",
        sheet: "28px",
      },
      spacing: {
        // Margem lateral fixa da tela.
        margem: "20px",
        toque: "44px",
        botao: "48px",
        campo: "54px",
        // Ação principal fixa no rodapé.
        acao: "54px",
      },
    },
  },
  plugins: [],
};
