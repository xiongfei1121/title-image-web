import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/app/assets/css/main.css'],
  compatibilityDate: '2024-10-08',
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
