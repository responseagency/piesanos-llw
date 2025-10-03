import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router.js'
import './style.css'
import airtableService from './services/airtable.js'
import locationService from './services/location.js'

/**
 * Helper function to load and create lookup mappings from cache
 * This resolves Beverage Type, Category, Format, and Size IDs to readable names
 */
async function loadLookupMappings() {
  try {
    const lookupCache = await import('./data/lookup-tables-cache.json')
    const lookupData = lookupCache.default?.data || lookupCache.data

    const mappings = {
      categories: {},
      types: {},
      formats: {},
      sizes: {}
    }

    // Build mappings from types
    if (lookupData.types && Array.isArray(lookupData.types)) {
      lookupData.types.forEach(record => {
        if (record.id && record.fields?.Name) {
          mappings.types[record.id] = record.fields.Name
        }
      })
    }

    // Build mappings from categories
    if (lookupData.categories && Array.isArray(lookupData.categories)) {
      lookupData.categories.forEach(record => {
        if (record.id && record.fields?.Name) {
          mappings.categories[record.id] = record.fields.Name
        }
      })
    }

    // Add fallback format mappings (not accessible via API)
    mappings.formats = {
      'recDlaYGEmS23x6gB': 'Glass',
      'rec0aUp7LnsIyyjoi': 'Bottle',
      'reckfsdGMlPPVFr4B': 'Draught',
      'recv5Y45UNDzSYkRN': 'Cocktail Glass',
      'recbYoh1uvlrXXnI5': 'Martini Glass',
      'recJOuYK67z0S23Gg': 'Wine Bottle',
      'reccRRXPCCn3zVjwY': 'Can',
      'recW9YJwXQBGdVx6b': 'Can'
    }

    // Add fallback size mappings (not accessible via API)
    mappings.sizes = {
      'rec2ILZWjw55W3tAZ': '6 oz',
      'recYifjWPwrg16nSU': '9 oz',
      'rece3G1UbwD51gzB6': '12 oz',
      'rec1bKYdnFr2uRnpB': '16 oz',
      'recoct47whZXNVi7g': '6 oz Snifter',
      'recZpEhpUYdzhEoNO': '25.4 oz',
      'rec24sY3kGxxGpRAL': '12 oz Bottle',
      'recYUplgpKJIBUhJq': '6.3 oz Mini',
      'rec5GO73jLOI8Jv6m': '12 oz Can'
    }

    return mappings
  } catch (error) {
    console.error('Error loading lookup mappings:', error)
    return {
      categories: {},
      types: {},
      formats: {},
      sizes: {}
    }
  }
}

/**
 * Enhance beverage data by resolving lookup field IDs to readable names
 */
function enhanceBeverageData(beverages, mappings) {
  return beverages.map(item => {
    const enhanced = { ...item }

    if (enhanced.fields) {
      // Resolve Beverage Categories
      if (enhanced.fields['Beverage Categories (from Beverage Item)']) {
        enhanced.fields['Beverage Categories Resolved'] = enhanced.fields['Beverage Categories (from Beverage Item)']
          .map(id => mappings.categories?.[id] || id)
      }

      // Resolve Beverage Type
      if (enhanced.fields['Beverage Type']) {
        enhanced.fields['Beverage Type Resolved'] = enhanced.fields['Beverage Type']
          .map(id => mappings.types?.[id] || id)
      }

      // Resolve Beverage Format
      if (enhanced.fields['Beverage Format']) {
        enhanced.fields['Beverage Format Resolved'] = enhanced.fields['Beverage Format']
          .map(id => mappings.formats?.[id] || id)
      }

      // Resolve Available Sizes
      if (enhanced.fields['Available Sizes']) {
        enhanced.fields['Available Sizes Resolved'] = enhanced.fields['Available Sizes']
          .map(id => mappings.sizes?.[id] || id)
      }

      // Resolve Selected Size
      if (enhanced.fields['Selected Size']) {
        enhanced.fields['Selected Size Resolved'] = enhanced.fields['Selected Size']
          .map(id => mappings.sizes?.[id] || id)
      }
    }

    return enhanced
  })
}

/**
 * Filter beverages by location
 * Returns only beverages available at the specified location
 */
function filterBeveragesByLocation(beverages, locationId) {
  if (!locationId) return beverages

  // Filter out beverages that have the current location in their "Unavailable Locations" field
  return beverages.filter(beverage => {
    const unavailableLocations = beverage.fields['Unavailable Locations'] || []
    return !unavailableLocations.includes(locationId)
  })
}

// Cache for data loaded during SSG - shared across all page renders
let ssgDataCache = null

// Export ViteSSG instance
export const createApp = ViteSSG(
  App,
  { routes },
  async ({ app, router, routes: allRoutes, isClient, initialState, url, ...rest }) => {
    // Pre-fetch data during SSG build
    if (!isClient) {
      try {
        // Get the actual route path being rendered from vite-ssg's routePath parameter
        const currentPath = rest.routePath || url || router.currentRoute.value.path

        // Find the matching route configuration by path
        const matchedRoute = allRoutes.find(r => r.path === currentPath) || allRoutes.find(r => r.path === '/')
        const locationId = matchedRoute?.meta?.locationId

        console.log(`[SSG] Rendering: ${currentPath} → locationId: ${locationId || 'ALL'}`)

        // Load data ONCE and cache it for subsequent pages
        if (!ssgDataCache) {
          console.log('[SSG] Loading data (first page)...')

          const [beverageData, locationData, lookupMappings] = await Promise.all([
            airtableService.getData(),
            locationService.getData(),
            loadLookupMappings()
          ])

          // Enhance ALL beverages with resolved lookup fields
          const allEnhancedBeverages = enhanceBeverageData(beverageData, lookupMappings)

          ssgDataCache = {
            allBeverages: allEnhancedBeverages,
            locations: locationData,
            lookupMappings
          }

          console.log(`[SSG] Data cached: ${ssgDataCache.allBeverages.length} beverages, ${ssgDataCache.locations.length} locations`)
        } else {
          console.log('[SSG] Using cached data')
        }

        // Filter beverages for THIS specific page's location
        const filteredBeverages = locationId
          ? filterBeveragesByLocation(ssgDataCache.allBeverages, locationId)
          : ssgDataCache.allBeverages

        console.log(`[SSG] Filtered to ${filteredBeverages.length} beverages for this location`)

        // Store ONLY this location's beverages in initialState
        initialState.beverages = filteredBeverages
        initialState.locations = ssgDataCache.locations
        initialState.lookupMappings = ssgDataCache.lookupMappings

        // Provide initialState to the app during SSR
        app.provide('initialState', initialState)
      } catch (error) {
        console.error('[SSG] ERROR during setup:', error)
        console.error(error.stack)
        initialState.beverages = []
        initialState.locations = []
        initialState.lookupMappings = { categories: {}, types: {}, formats: {}, sizes: {} }

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
