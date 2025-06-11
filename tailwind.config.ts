import type { Config } from "tailwindcss";

// O objeto de configuração começa aqui
const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // A chave 'theme' deve estar DENTRO do objeto 'config'
  theme: {
    extend: {
      colors: {
        // Cores customizadas para o nosso tema
        'dark-bg': 'rgb(var(--background-start-rgb))',
        'dark-card': 'rgb(var(--card-rgb))',
        'primary': 'rgb(var(--primary-rgb))',
      },
      animation: {
        // Registrando nossa animação para ser usada como 'animate-fade-in'
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  // A chave 'plugins' também deve estar DENTRO do objeto 'config'
  plugins: [],
};
// A exportação acontece apenas uma vez, no final de tudo
export default config;