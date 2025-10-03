import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router.js'
import './style.css'
import airtableService from './services/airtable.js'
import locationService from './services/location.js'

// Export ViteSSG instance
export const createApp = ViteSSG(
  App,
  { routes },
  async ({ app, router, routes, isClient, initialState }) => {
    // App setup - plugins, directives, etc. can go here

    // Pre-fetch data during SSG build
    if (!isClient) {
      try {
        // Load data during SSG build
        const [beverageData, locationData] = await Promise.all([
          airtableService.getData(),
          locationService.getData()
        ])

        // Store in initialState for hydration
        initialState.beverages = beverageData
        initialState.locations = locationData

        // Provide initialState to the app during SSR
        app.provide('initialState', initialState)
      } catch (error) {
        console.error('Error loading data during SSG:', error)
        initialState.beverages = []
        initialState.locations = []

        // Provide empty initialState even on error
        app.provide('initialState', initialState)
      }
    }

    // Client-side only initialization
    if (isClient) {
      // Provide initialState to the app during client hydration
      // This allows components to access window.__INITIAL_STATE__
      app.provide('initialState', initialState)
    }
  }
)
