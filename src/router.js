import { createRouter, createWebHistory, createMemoryHistory } from 'vue-router'
import locationService from './services/location.js'
import locationsCache from './data/locations-cache.json'
import App from './App.vue'

// Get all active locations for route generation
const locations = (locationsCache.data || []).filter(loc =>
  locationService.isLocationActive(loc)
)

// Generate routes for all locations - each uses App.vue as component
const locationRoutes = locations.map(location => {
  const slug = locationService.getLocationSlug(location)
  const name = locationService.formatLocationName(location)

  return {
    path: `/${slug}`,
    name: slug,
    component: App,  // Use App component directly (not dynamic import)
    meta: {
      locationSlug: slug,
      locationId: location.id,
      locationName: name
    }
  }
})

// Define all routes - each uses App.vue as component
export const routes = [
  {
    path: '/',
    name: 'home',
    component: App,  // Use App component directly (not dynamic import)
    meta: {
      locationSlug: null,
      locationId: null,
      locationName: 'All Locations'
    }
  },
  ...locationRoutes
]

// Create router factory function
export function createAppRouter() {
  const router = createRouter({
    // Use memory history for SSR/SSG, web history in browser
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        return savedPosition
      } else {
        return { top: 0 }
      }
    }
  })

  return router
}
