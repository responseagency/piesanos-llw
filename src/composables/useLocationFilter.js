import { ref, computed, watch, onMounted } from 'vue'
import locationService from '../services/location.js'

export function useLocationFilter() {
  const locations = ref([])
  const selectedLocationId = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Get current location from URL params
  const getLocationFromURL = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('location')
  }

  // Update URL with location parameter
  const updateURL = (locationSlug) => {
    const url = new URL(window.location)
    if (locationSlug) {
      url.searchParams.set('location', locationSlug)
    } else {
      url.searchParams.delete('location')
    }

    // Ensure only one hash character in URL by removing any existing hash and properly reconstructing
    const urlString = url.toString()
    const cleanUrl = urlString.split('#')[0] // Remove any hash fragments

    // Update URL without page reload
    window.history.pushState({}, '', cleanUrl)
  }

  // Get location by slug
  const getLocationBySlug = (slug) => {
    return locations.value.find(location => {
      const locationSlug = locationService.getLocationSlug(location)
      const formattedName = locationService.formatLocationName(location)

      // Debug logging for location matching
      if (process.env.NODE_ENV === 'development') {
        console.log(`Comparing slug: "${slug}" with location slug: "${locationSlug}" (formatted name: "${formattedName}")`)
      }

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

      // Initialize selected location from URL or default to first location
      initializeSelectedLocation()
    } catch (err) {
      error.value = err.message || 'Failed to fetch locations'
      console.error('Error in useLocationFilter:', err)
    } finally {
      loading.value = false
    }
  }

  // Initialize selected location from URL or default
  const initializeSelectedLocation = () => {
    const locationSlugFromURL = getLocationFromURL()

    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 Initializing location selection:`)
      console.log(`  - URL slug: "${locationSlugFromURL}"`)
      console.log(`  - Available locations: ${activeLocations.value.length}`)
      activeLocations.value.forEach((loc, index) => {
        const slug = locationService.getLocationSlug(loc)
        const formattedName = locationService.formatLocationName(loc)
        console.log(`    ${index + 1}. ID: ${loc.id}, Name: "${formattedName}", Slug: "${slug}"`)
      })
    }

    if (locationSlugFromURL) {
      const locationFromURL = getLocationBySlug(locationSlugFromURL)
      if (locationFromURL) {
        selectedLocationId.value = locationFromURL.id
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Found location from URL: ${locationService.formatLocationName(locationFromURL)}`)
        }
        return
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Could not find location for slug: "${locationSlugFromURL}"`)
        }
      }
    }

    // Default to first active location if no URL param or invalid param
    if (activeLocations.value.length > 0) {
      selectedLocationId.value = activeLocations.value[0].id
      // Update URL with default location
      const defaultSlug = locationService.getLocationSlug(activeLocations.value[0])
      updateURL(defaultSlug)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Defaulted to first location: ${locationService.formatLocationName(activeLocations.value[0])}`)
      }
    }
  }

  // Set selected location and update URL
  const setSelectedLocation = (locationId) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 Setting location to ID: ${locationId}`)
    }

    selectedLocationId.value = locationId

    if (locationId) {
      const location = locations.value.find(loc => loc.id === locationId)
      if (location) {
        const slug = locationService.getLocationSlug(location)
        const formattedName = locationService.formatLocationName(location)
        updateURL(slug)
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Updated URL with location: "${formattedName}" (slug: "${slug}")`)
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`❌ Could not find location with ID: ${locationId}`)
        }
      }
    } else {
      updateURL(null)
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔄 Cleared location selection`)
      }
    }
  }

  // Watch for browser back/forward navigation
  const handlePopState = () => {
    const locationSlugFromURL = getLocationFromURL()

    if (locationSlugFromURL) {
      const locationFromURL = getLocationBySlug(locationSlugFromURL)
      if (locationFromURL && locationFromURL.id !== selectedLocationId.value) {
        selectedLocationId.value = locationFromURL.id
      }
    }
  }

  // Filter beverages based on selected location
  const filterBeveragesByLocation = (beverages) => {
    if (!selectedLocation.value || !beverages) return beverages

    // Filter out beverages that have the current location in their "unavailable locations" field
    // Adjust field names based on your Airtable schema
    return beverages.filter(beverage => {
      const unavailableLocations = beverage.fields['Unavailable Locations'] || []
      return !unavailableLocations.includes(selectedLocation.value.id)
    })
  }

  // Setup browser navigation listeners
  onMounted(() => {
    window.addEventListener('popstate', handlePopState)

    // Cleanup on unmount
    const cleanup = () => {
      window.removeEventListener('popstate', handlePopState)
    }

    return cleanup
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
    getLocationBySlug,
    getLocationFromURL
  }
}