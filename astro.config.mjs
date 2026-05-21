import { defineConfig } from 'astro/config';

// IMPORTANT: подменить на свой домен перед деплоем (или передавать через env)
const SITE = process.env.SITE_URL || 'https://kalkremont.ru';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto'
  },
  compressHTML: true
});
