// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,

  app: {
    head: {
      title: 'Piesanos Beverage Menu',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ]
    }
  },

  components: {
    dirs: [
      {
        path: '~/src/components',
        pathPrefix: false,
        global: true
      }
    ]
  },

  css: ['~/src/style.css'],

  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: false, // Bundle all CSS into one file
    }
  },

  experimental: {
    inlineStyles: true, // Inline CSS into HTML
  },

  runtimeConfig: {
    // Server-side only - not exposed to client
    airtableToken: process.env.AIRTABLE_TOKEN || process.env.VITE_AIRTABLE_TOKEN,
    airtableBaseId: process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID,
    airtableTableName: process.env.AIRTABLE_TABLE_NAME || process.env.VITE_AIRTABLE_TABLE_NAME,
    airtableViewId: process.env.AIRTABLE_VIEW_ID || process.env.VITE_AIRTABLE_VIEW_ID,
    airtableLocationsTableName: process.env.AIRTABLE_LOCATIONS_TABLE_NAME || process.env.VITE_AIRTABLE_LOCATIONS_TABLE_NAME,
    public: {}
  },

  // Cache aggressively since data only changes 1-2x per month
  routeRules: {
    '/**': { swr: 86400, cache: { maxAge: 86400 } }, // 24 hour cache
    '/api/**': { swr: 3600, cache: { maxAge: 3600 } } // 1 hour API cache
  },

  nitro: {
    compressPublicAssets: true,
    preset: 'netlify'
  },

  compatibilityDate: '2025-10-03'
})
