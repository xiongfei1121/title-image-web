import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
    '@nuxtjs/i18n',
  ],
  srcDir: 'app',
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-10-08',
  i18n: {
    locales: [
      { code: 'zh-CN', name: '中文' },
      { code: 'en-US', name: 'English' },
    ],
    defaultLocale: 'zh-CN',
    langDir: 'i18n/locales',
    strategy: 'no_prefix',
  },
  nitro: {
    prerender: {
      crawlLinks: false,
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://117.36.154.21:5001',
    },
  },
})
