import { defineConfig } from 'docusite';
import path from "path";
import { writeFileSync } from "node:fs";
import { makeIdentIcon } from "./dist/index.js";

writeFileSync(
  path.resolve('./docs/public/logo.svg'),
  makeIdentIcon(-1)
)

export default defineConfig({
  packageJsonPath: '.',
  base: `/@{packageJson.name}/`,
  title: '@{packageJson.name}',
  description: '@{packageJson.description}',
  search: 'local',
  head: [
    ['style', {}, '.VPImage.image-src { width: 256px; height: 256px; border-radius: 28px; } .VPImage.logo { border-radius: 8px; }'],
  ],
  github: 'https://github.com/@{packageJson.author}/@{packageJson.name}',
  colors: {
    light: ['#0066db', '#56a5ff', '#6b4eff'],
    dark: ['#8bc5ff', '#56a5ff', '#a891ff'],
  },
  logos: {
    main: '/public/logo.svg',
  },
  nav: [
    { text: 'Home', link: '/' },
    { text: 'Guide', link: '/guide/getting-started' },
    { text: 'Playground', link: '/playground' },
    { text: 'API', link: '/api' },
  ],
  sidebar: [
    {
      text: 'Playground',
      items: [{ text: 'Explore logos', link: '/playground' }],
    },
    {
      text: 'Guide',
      items: [{ text: 'Getting started', link: '/guide/getting-started' }],
    },
    {
      text: 'API',
      items: [
        { text: 'Functions', link: '/api' },
        { text: 'Output format', link: '/api/output' },
      ],
    },
  ],
});
