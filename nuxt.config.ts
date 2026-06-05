import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  srcDir: 'app',
  vite: {
    plugins: [tailwindcss()],
  },
  css: ['~/assets/css/main.css'],
  compatibilityDate: '2024-10-08',
  nitro: {
    prerender: {
      crawlLinks: false,
    },
  },
  runtimeConfig: {
    public: {
      apiBase: 'https://file.081213.xyz:8899',
    },
  },
})
