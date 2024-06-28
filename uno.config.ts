import fs from "fs/promises";
import { flavors } from "@catppuccin/palette";
import {
  defineConfig,
  presetUno,
  presetIcons,
  presetTypography,
} from "unocss";

const generatePalette = (): { [key: string]: string } => {
  const colors: { [key: string]: string } = {};
  Object.keys(flavors.mocha.colors).forEach((colorName) => {
    const sanitizedName = colorName
      .replace("0", "zero")
      .replace("1", "one")
      .replace("2", "two");
    colors[sanitizedName] = flavors.mocha.colors[colorName].hex;
  });

  return colors;
};

const catppuccinColors = generatePalette();

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
          color: catppuccinColors.mauve,
          "background-color": catppuccinColors.crust,
        },
        "a:hover": {
          color: catppuccinColors.red,
        },
        "a:visited": {
          color: "none",
        },
        ...[
          ["h1", catppuccinColors.sky],
          ["h2", catppuccinColors.green],
          ["h3", catppuccinColors.flamingo],
          ["h4", catppuccinColors.maroon],
        ].reduce((acc, [header, color]) => {
          acc[header] = {
            "font-size": "1.25em",
            color: color,
          };
          return acc;
        }, {}),
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
      ctp: catppuccinColors,
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
