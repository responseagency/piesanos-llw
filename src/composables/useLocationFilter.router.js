import { ref, computed, onMounted, useSSRContext } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import locationService from '../services/location.js'

export function useLocationFilter() {
  const route = useRoute()
  const router = useRouter()

  const locations = ref([])
  const selectedLocationId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Try to get initial state from SSR context
  if (import.meta.env.SSR) {
    try {
      const ctx = useSSRContext()
      if (ctx?.initialState?.locations) {
        locations.value = ctx.initialState.locations
      }
    } catch (e) {
      // SSR context not available, will fetch normally
    }
  } else if (typeof window !== 'undefined' && window.__INITIAL_STATE__?.locations) {
    // Hydrate from window initial state on client
    locations.value = window.__INITIAL_STATE__.locations
  }

  // Get current location from route meta
  const getLocationFromRoute = () => {
    return route.meta?.locationId || null
  }

  // Initialize selected location from route if we have locations data
  const initializeFromRoute = () => {
    if (locations.value && locations.value.length > 0) {
      const locationIdFromRoute = getLocationFromRoute()
      if (locationIdFromRoute) {
        selectedLocationId.value = locationIdFromRoute
      }
    }
  }

  // Initialize immediately if we have data from SSR
  initializeFromRoute()

  // Get location by slug
  const getLocationBySlug = (slug) => {
    return locations.value.find(location => {
      const locationSlug = locationService.getLocationSlug(location)
      return locationSlug === slug
    })
  }

  // Get current selected location object
  const selectedLocation = computed(() => {
    if (!selectedLocationId.value || !locations.value.length) return null
    return locations.value.find(location => location.id === selectedLocationId.value)
  })

  // Get location display name
  const selectedLocationName = computed(() => {
    return selectedLocation.value
      ? locationService.formatLocationName(selectedLocation.value)
      : 'All Locations'
  })

  // Get active locations only
  const activeLocations = computed(() => {
    return locations.value.filter(location => locationService.isLocationActive(location))
  })

  // Fetch locations data
  const fetchLocations = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await locationService.getData()
      locations.value = result || []

      // Initialize selected location from route
      initializeSelectedLocation()
    } catch (err) {
      error.value = err.message || 'Failed to fetch locations'
      console.error('Error in useLocationFilter:', err)
    } finally {
      loading.value = false
    }
  }

  // Initialize selected location from route
  const initializeSelectedLocation = () => {
    const locationIdFromRoute = getLocationFromRoute()

    if (locationIdFromRoute) {
      selectedLocationId.value = locationIdFromRoute
    } else if (activeLocations.value.length > 0) {
      // Default to first active location for home route
      selectedLocationId.value = activeLocations.value[0].id
    }
  }

  // Set selected location and navigate to route
  const setSelectedLocation = (locationId) => {
    selectedLocationId.value = locationId

    if (locationId) {
      const location = locations.value.find(loc => loc.id === locationId)
      if (location) {
        const slug = locationService.getLocationSlug(location)
        router.push(`/${slug}`)
      }
    } else {
      router.push('/')
    }
  }

  // Filter beverages based on selected location
  const filterBeveragesByLocation = (beverages) => {
    if (!selectedLocation.value || !beverages) return beverages

    // Filter out beverages that have the current location in their "unavailable locations" field
    return beverages.filter(beverage => {
      const unavailableLocations = beverage.fields['Unavailable Locations'] || []
      return !unavailableLocations.includes(selectedLocation.value.id)
    })
  }

  onMounted(() => {
    // Re-initialize when route changes
    initializeSelectedLocation()
  })

  return {
    // State
    locations,
    selectedLocationId,
    selectedLocation,
    selectedLocationName,
    activeLocations,
    loading,
    error,

    // Methods
    fetchLocations,
    setSelectedLocation,
    filterBeveragesByLocation,

    // Utilities
    getLocationBySlug
  }
}
