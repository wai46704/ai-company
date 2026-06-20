import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  output: 'static',
  site: 'https://naoki-blog.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
});
