import fs from "fs/promises";
import { defineConfig } from "unocss";
import transformerDirectives from "@unocss/transformer-directives";
import presetWebFonts from "@unocss/preset-web-fonts";
import presetUno from "@unocss/preset-uno";
import presetTypography from "@unocss/preset-typography";
import { variants } from "@catppuccin/palette";
import presetIcons from "@unocss/preset-icons";


const generatePalette = () => {
  const colors = {};

  Object.keys(variants.mocha).forEach((colorName) => {
    const sanitizedName = colorName.replace('0', 'zero').replace('1', 'one').replace('2', 'two');
    colors[sanitizedName] = variants.mocha[colorName].hex;
  });

  return colors;
};


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
    #menu-toggle:checked + #menu {
		  display: block;
		}
    a:hover {
      color: ${theme.colors.ctp.red}
    }
    a:not([href*='brain.dayl.in']):not([href^='#']):not([href^='/']):not([href*='localhost']):after {
      content: '🔗';
    }
    .markdown {
      color: var(--un-prose-body);
      max-width: 100ch;
      }
    `,

    },
  ],
  transformers: [transformerDirectives()],
  shortcuts: [{
    box: "max-w-6xl mx-auto rounded-md p-4",
    "nav-link": "md:p-1 px-0 border-b-2 border-transparent hover:b-ctp-red",
    "nav-menu-btn": "cursor-pointer md:hidden flex items-center px-3 py-2"
  }],
  presets: [
    presetUno(),
    presetIcons(),
    presetTypography({
      selectorName: "markdown", // now use like `markdown markdown-gray`, `not-markdown`
      // cssExtend is an object with CSS selector as key and
      // CSS declaration block as value like writing normal CSS.
      cssExtend: {
        // remove backticks from inline code
        // ':not(pre) > code::before,:not(pre) > code::after': {
        //     content: "",
        // },
        code: {
          color: variants.mocha.mauve.hex,
          background: variants.mocha.crust.hex,
        },
        "a:hover": {
          color: variants.mocha.red.hex,
        },
        "a:visited": {
          color: "none",
        },
        ...[
          ["h1", variants.mocha.sky.hex],
          ["h2", variants.mocha.green.hex],
          ["h3", variants.mocha.flamingo.hex],
          ["h4", variants.mocha.maroon.hex],
        ].reduce((acc, [header, color]) => {
          acc[header] = {
            "font-size": "1.25em",
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
        // sans: "Recursive",
        // mono: "Recursive:wght,CASL,MONO@400,0,1;700,1,1;1000,1,1"
      },
    }),
  ],
  rules: [
    ["font-mono", {
      "font-family": "'Recursive', monospace;",
      "font-variation-settings": "'MONO' 1;"
    }],
    ["font-casual", { "font-variation-settings": "'CASL' 1;" }],
    ["font-mono-casual", { "font-variation-settings": "'MONO' 1, 'CASL' 1;" }],
  ],
  theme: {
    colors: {
      ctp: generatePalette(),
    },
  },
  layers: {
    reset: -1,
    components: 0,
    default: 1,
    utilities: 2,
    mycss: 3,
  },
});
