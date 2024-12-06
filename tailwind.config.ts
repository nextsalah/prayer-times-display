// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{html,svelte,js,ts}"],
  theme: {
    extend: {
      screens: {
        'portrait': { 'raw': '(orientation: portrait)' },
        'landscape': { 'raw': '(orientation: landscape)' },
      }
    },
  },
  plugins: [require('daisyui'), require("@tailwindcss/typography")],
  daisyui: {
    themes: true,
    darkTheme: "dim",
  }
}

export default config