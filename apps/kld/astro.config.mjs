import { defineConfig } from 'astro/config';
const SITE = process.env.SITE_URL || 'https://kld.kalkremont.ru';
export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true
});
