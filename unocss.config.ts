import fs from "fs/promises";
import { defineConfig } from "unocss";
import transformerDirectives from "@unocss/transformer-directives";
import presetWebFonts from "@unocss/preset-web-fonts";
import presetUno from "@unocss/preset-uno";
import presetTypography from "@unocss/preset-typography";
import presetIcons from "@unocss/preset-icons";

import { flavors, flavorEntries } from "@catppuccin/palette";

// not possible to use colors with letter and hyphen..
const palette = (() => {
  const colors = flavors.mocha.colors;
  const palette = {};
  Object.keys(colors).forEach((colorName) => {
    const sanitizedName = colorName
      .replace("0", "zero")
      .replace("1", "one")
      .replace("2", "two");
    palette[sanitizedName] = colors[colorName].hex;
  });

  return palette;
})();


export default defineConfig({
  preflights: [
    {
      layer: "reset",
      getCSS: () =>
        fs.readFile("node_modules/@unocss/reset/tailwind.css", "utf-8"),
    },
    {
      layer: "mycss",
      getCSS: ({theme}) => `
    /* width */
    ::-webkit-scrollbar {
        width: 10px;
    }
    /* Track */
    ::-webkit-scrollbar-track {
        background: ${theme.colors.ctp.crust};
        border-radius: 5px;
    }
    /* Handle */
    ::-webkit-scrollbar-thumb {
        background: ${theme.colors.ctp.mantle};
        border: 1px solid transparent;
        border-color: ${theme.colors.ctp.rosewater};
        border-radius: 5px;
    }
    /* Handle on hover */
    ::-webkit-scrollbar-thumb:hover {
        background: ${theme.colors.ctp.roswater};
    }
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

    /* the chroma style uses base which I use for the panel background */
    .highlight code span, .highlight pre, pre, code {
      background-color: ${theme.colors.ctp.mantle} !important;
    }
    `,
    },
  ],
  transformers: [transformerDirectives()],
  shortcuts: [
    {
      box: "max-w-6xl mx-auto rounded-md p-4",
      "nav-link": "md:p-1 px-0 border-b-2 border-transparent hover:b-ctp-red",
      "nav-menu-btn": "cursor-pointer md:hidden flex items-center px-3 py-2",
    },
  ],
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
          color: palette.mauve,
          "background-color": palette.crust,
        },
        "a:hover": {
          color: palette.red,
        },
        "a:visited": {
          color: "none",
        },
        ...[
          ["h1", palette.sky],
          ["h2", palette.green],
          ["h3", palette.flamingo],
          ["h4", palette.maroon],
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
    [
      "font-mono",
      {
        "font-family": "'Recursive', monospace;",
        "font-variation-settings": "'MONO' 1;",
      },
    ],
    ["font-casual", { "font-variation-settings": "'CASL' 1;" }],
    ["font-mono-casual", { "font-variation-settings": "'MONO' 1, 'CASL' 1;" }],
  ],
  theme: {
    colors: {
      ctp: palette,
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
