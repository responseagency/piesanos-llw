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
      } catch (error) {
        console.error('Error loading data during SSG:', error)
        initialState.beverages = []
        initialState.locations = []
      }
    }

    // Client-side only initialization
    if (isClient) {
      // Any client-only setup can go here
    }
  }
)
