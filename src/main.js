import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router.js'
import './style.css'

// Export ViteSSG instance
export const createApp = ViteSSG(
  App,
  { routes },
  ({ app, router, routes, isClient, initialState }) => {
    // App setup - plugins, directives, etc. can go here

    // Client-side only initialization
    if (isClient) {
      // Any client-only setup can go here
    }
  }
)
