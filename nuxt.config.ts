export default defineNuxtConfig({
  srcDir: '.',
  compatibilityDate: '2026-10-01',
  modules: ['@nuxtjs/supabase', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  supabase: { redirect: false },
  runtimeConfig: { public: { appName: 'My Recipe Vault' } },
  app: { head: { title: 'My Recipe Vault', meta: [{ name: 'description', content: 'Your recipes, your memories, your kitchen.' }] } },
  typescript: { strict: true }
})
