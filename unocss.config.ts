import fs from "fs/promises";
import { defineConfig } from "unocss";
import transformerDirectives from "@unocss/transformer-directives";
import presetWebFonts from "@unocss/preset-web-fonts";
import presetUno from "@unocss/preset-uno";
import presetTypography from "@unocss/preset-typography";
import { variants } from "@catppuccin/palette";
import presetIcons from "@unocss/preset-icons";

export default defineConfig({
  preflights: [
    {
      layer: "reset",
      getCSS: () =>
        fs.readFile("node_modules/@unocss/reset/tailwind.css", "utf-8"),
    },
    {
      layer: "mycss",
      getCSS: ({ theme }) => `
    a:hover {
      color: ${theme.colors.ctp.red}
    }
    a:not([href*='brain.dayl.in']):not([href^='#']):not([href^='/']):after {
      content: '🔗'
    }
    `,
    },
  ],
  transformers: [transformerDirectives()],
  shortcuts: [{ box: "max-w-6xl mx-auto rounded-md p-4" }],
  presets: [
    presetUno(),
    presetIcons(),
    presetTypography({
      selectorName: "markdown", // now use like `markdown markdown-gray`, `not-markdown`
      // cssExtend is an object with CSS selector as key and
      // CSS declaration block as value like writing normal CSS.
      cssExtend: {
        // code: {
        //   color: "#8b5cf6",
        // },
        "a:hover": {
          color: "#f43f5e",
        },
        "a:visited": {
          color: "none",
        },
        ...[
          ["h1", variants.mocha.sky.hex],
          ["h2", variants.mocha.red.hex],
          ["h3", variants.mocha.flamingo.hex],
          ["h4", variants.mocha.maroon.hex],
        ].reduce((acc, [header, color]) => {
          acc[header] = {
            "font-size": "1.25 em",
            color: color,
          };
          return acc;
        }, {}),
      },
    }),
    presetWebFonts({
      provider: "google", // default provider
      fonts: {
        // these will extend the default theme
        sans: "Recursive",
        mono: "Recursive",
      },
    }),
  ],
  theme: {
    colors: {
      // definitely a way to return this with a lambda function
      // i.e. () => {}
      ctp: {
        red: variants.mocha.red.hex,
        lavender: variants.mocha.lavender.hex,
        base: variants.mocha.base.hex,
        crust: variants.mocha.crust.hex,
        mantle: variants.mocha.mantle.hex,
        text: variants.mocha.text.hex,
        surfacezero: variants.mocha.surface0.hex,
      },
    },
  },
});
