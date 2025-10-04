<template>
  <div>
    <MenuBar />
    <DrinkSubmenu />
    <DrinkSections />
    <DebugPanel
      v-if="showDebug"
      :selectedLocationId="selectedLocationId || 'all'"
      :locations="locations"
      :beverageStats="stats?.typeBreakdown || {}"
      :showOnlyAvailable="false"
      :sortBy="'name'"
    />
  </div>
</template>

<script setup>
import {
  organizeByHierarchy,
  filterHierarchy,
  sortHierarchyByPrice,
  getHierarchyStats
} from '~/utils/hierarchicalBeverageOrganizer'

// Get location slug from route
const route = useRoute()
const locationSlug = computed(() => route.params.location)

// Fetch data from server API
const { data: beverageData } = await useFetch('/api/enhanced-beverages')
const { data: locationData } = await useFetch('/api/locations')

// Extract data from response
const allBeverages = computed(() => beverageData.value?.data || [])
const locations = computed(() => locationData.value?.data || [])
const lookupMappings = computed(() => beverageData.value?.mappings || {})

// Find the selected location
const selectedLocation = computed(() => {
  return locations.value.find(loc => {
    const locName = loc.fields?.['Location Name'] || loc.fields?.Name || ''
    const slug = locName.toLowerCase().replace(/\s+/g, '-')
    return slug === locationSlug.value
  })
})

const selectedLocationId = computed(() => selectedLocation.value?.id || null)

// Filter beverages by location
const beverages = computed(() => {
  if (!selectedLocationId.value) return allBeverages.value

  return allBeverages.value.filter(item => {
    const itemLocations = item.fields?.Locations || []
    return itemLocations.includes(selectedLocationId.value)
  })
})

// URL params for debug mode
const { showDebug } = useUrlParams()

// Beverages are already enriched by the server with resolved names
// Dynamic category mapping
const {
  availableTypes,
  availableCategories,
  selectedType,
  selectedCategory,
  filteredByCategory
} = useDynamicCategoryMapping(beverages)

// Organize beverages hierarchically
const organizedBeverages = computed(() => {
  if (!filteredByCategory?.value) {
    return []
  }
  const organized = organizeByHierarchy(filteredByCategory.value)
  return sortHierarchyByPrice(organized)
})

// Get stats
const stats = computed(() => {
  if (!organizedBeverages?.value) {
    return { totalCount: 0, typeBreakdown: {} }
  }
  return getHierarchyStats(organizedBeverages.value)
})

// Provide data to child components
provide('beverages', organizedBeverages)
provide('stats', stats)
provide('locations', locations)
provide('selectedLocationId', selectedLocationId)
provide('selectedType', selectedType)
provide('selectedCategory', selectedCategory)
provide('availableTypes', availableTypes)
provide('availableCategories', availableCategories)
</script>
