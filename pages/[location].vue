<template>
  <div>
    <MenuBar />
    <DrinkSubmenu />
    <div class="h-20"></div>
    <DrinkSections />
  </div>
</template>

<script setup>
import {
  organizeByHierarchy,
  sortHierarchyByPrice,
  getHierarchyStats
} from '~/utils/hierarchicalBeverageOrganizer'
import { getLocationSlug } from '~/utils/locationHelpers'

// Get location slug from route
const route = useRoute()
const locationSlug = computed(() => route.params.location)

// Fetch data from server API
const { data: beverageData } = await useFetch('/api/enhanced-beverages')
const { data: locationData } = await useFetch('/api/locations')

// Extract data from response
const allBeverages = computed(() => beverageData.value?.data || [])
const locations = computed(() => locationData.value?.data || [])

// Find the selected location
const selectedLocation = computed(() => {
  return locations.value.find(loc => {
    const slug = getLocationSlug(loc)
    return slug === locationSlug.value
  })
})

const selectedLocationId = computed(() => selectedLocation.value?.id || null)
const selectedLocationNumber = computed(() => selectedLocation.value?.fields?.['Location Number'] || null)

// Filter beverages by location
const beverages = computed(() => {
  if (!selectedLocationId.value) return allBeverages.value

  return allBeverages.value.filter(item => {
    const unavailableLocations = item.fields?.['Unavailable Locations'] || []
    return !unavailableLocations.includes(selectedLocationId.value)
  })
})

// Organize beverages hierarchically (no filtering needed - show all types)
const organizedBeverages = computed(() => {
  const organized = organizeByHierarchy(beverages.value, selectedLocationNumber.value)
  return sortHierarchyByPrice(organized)
})

// Get stats
const stats = computed(() => {
  return getHierarchyStats(organizedBeverages.value)
})

// Provide data to child components
provide('beverages', organizedBeverages)
provide('stats', stats)
provide('locations', locations)
provide('selectedLocationId', selectedLocationId)
</script>
