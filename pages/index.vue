<template>
  <div>
    <MenuBar />
    <DrinkSubmenu />
    <DrinkSections />
    <DebugPanel
      v-if="showDebug"
      :selectedLocationId="selectedLocationId?.value || 'all'"
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

// Fetch data from server API
const { data: beverageData } = await useFetch('/api/enhanced-beverages')
const { data: locationData } = await useFetch('/api/locations')

// Extract data from response
const beverages = computed(() => beverageData.value?.data || [])
const locations = computed(() => locationData.value?.data || [])
const lookupMappings = computed(() => beverageData.value?.mappings || {})

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
provide('selectedLocationId', ref(null))
provide('selectedType', selectedType)
provide('selectedCategory', selectedCategory)
provide('availableTypes', availableTypes)
provide('availableCategories', availableCategories)
</script>
