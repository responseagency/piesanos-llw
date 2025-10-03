<template>
  <div class="min-h-screen bg-gold-50">
    <!-- Promo Bar -->
    <PromoBar />

    <!-- Menu Bar -->
    <MenuBar />

    <!-- Drink Submenu -->
    <DrinkSubmenu />

    <!-- Content -->
    <div class="max-w-[1024px] mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading beverages...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-semibold">Error Loading Data</h3>
        <p class="text-red-600 mt-1">{{ error }}</p>
      </div>

      <div v-else-if="hierarchicalBeverages && Object.keys(hierarchicalBeverages).length > 0">
        <!-- Hierarchical Drink Sections -->
        <div class="space-y-12">
          <DrinkSection
            v-for="(section, sectionId) in hierarchicalBeverages"
            :key="sectionId"
            :section-id="sectionId"
            :section="section"
          />
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-600">No beverages available</p>
      </div>
    </div>

    <!-- Compact Debug Panel (Debug Mode Only) -->
    <DebugPanel
      v-if="isDebugMode"
      :selected-location-id="selectedLocationId"
      :locations="locations"
      :location-loading="locationLoading"
      :location-error="locationError"
      :last-updated="lastUpdated"
      :beverage-stats="hierarchicalStats"
      :mapping-stats="mappingStats"
      v-model:show-only-available="showOnlyAvailable"
      v-model:sort-by="sortBy"
      :is-refreshing="isRefreshing"
      :refresh-message="refreshMessage"
      :refresh-error="refreshError"
      @location-changed="handleLocationChange"
      @refresh="refreshData"
    />

  </div>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue'
import { useAirtable } from './composables/useAirtable'
import { useLocationFilter } from './composables/useLocationFilter'
import { useDynamicCategoryMapping } from './composables/useDynamicCategoryMapping'
import { useUrlParams } from './composables/useUrlParams'
import BeverageSection from './components/BeverageSection.vue'
import WineSection from './components/WineSection.vue'
import BeerSection from './components/BeerSection.vue'
import LocationSelector from './components/LocationSelector.vue'
import PromoBar from './components/PromoBar.vue'
import MenuBar from './components/MenuBar.vue'
import DrinkSection from './components/DrinkSection.vue'
import DrinkSubmenu from './components/DrinkSubmenu.vue'
import DebugPanel from './components/DebugPanel.vue'
import {
  groupBeveragesByType,
  sortBeveragesByPrice,
  filterBeverages,
  getBeverageStats
} from './utils/beverageOrganizer'
import {
  organizeByHierarchy,
  filterHierarchy,
  sortHierarchyByPrice,
  getHierarchyStats
} from './utils/hierarchicalBeverageOrganizer'

export default {
  name: 'App',
  components: {
    BeverageSection,
    WineSection,
    BeerSection,
    LocationSelector,
    PromoBar,
    MenuBar,
    DrinkSection,
    DrinkSubmenu,
    DebugPanel
  },
  setup() {
    const { data, loading, error, fetchData } = useAirtable()
    const {
      locations,
      selectedLocationId,
      selectedLocation,
      selectedLocationName,
      activeLocations,
      loading: locationLoading,
      error: locationError,
      fetchLocations,
      setSelectedLocation
    } = useLocationFilter()
    const { getCategoryName, dynamicCategoryMapping, mappingStats } = useDynamicCategoryMapping(data)
    const { isDebugMode } = useUrlParams()
    const lastUpdated = ref(null)
    const showOnlyAvailable = ref(false)
    const sortBy = ref('name')

    // Debug refresh state
    const isRefreshing = ref(false)
    const refreshMessage = ref('')
    const refreshError = ref(false)

    // Provide the dynamic category mapping and location filter to child components
    provide('categoryMapping', {
      getCategoryName,
      dynamicMapping: dynamicCategoryMapping,
      stats: mappingStats
    })

    provide('locationFilter', {
      setSelectedLocation,
      selectedLocationId,
      selectedLocation,
      selectedLocationName
    })

    const organizedBeverages = computed(() => {
      if (!data.value) return {}
      return groupBeveragesByType(data.value)
    })

    const beverageStats = computed(() => {
      if (!organizedBeverages.value) return {}
      return getBeverageStats(organizedBeverages.value)
    })

    const displayedBeverages = computed(() => {
      if (!organizedBeverages.value) return {}

      // Apply combined filtering (location + availability + custom filters)
      let beverages = filterBeverages(organizedBeverages.value, {
        showOnlyAvailable: showOnlyAvailable.value,
        selectedLocationId: selectedLocationId.value
      })

      // Sort beverages within each type
      if (sortBy.value.startsWith('price')) {
        const ascending = sortBy.value === 'price-asc'
        beverages = sortBeveragesByPrice(beverages, ascending)
      }

      // Sort the types themselves for consistent display order
      const typeOrder = ['Wine - Red', 'Wine - White', 'Wine - Blush', 'Wine - Other', 'Beer - Draught', 'Beer - Bottles', 'Beer - Other', 'Cocktails', 'Hard Seltzer', 'Cider', 'Other']
      const sorted = {}
      typeOrder.forEach(type => {
        if (beverages[type] && beverages[type].length > 0) {
          sorted[type] = beverages[type]
        }
      })

      // Add any types not in the predefined order
      Object.keys(beverages).forEach(type => {
        if (!typeOrder.includes(type) && beverages[type].length > 0) {
          sorted[type] = beverages[type]
        }
      })

      return sorted
    })

    const wineSubcategories = computed(() => {
      const result = {}
      Object.keys(displayedBeverages.value).forEach(type => {
        if (type.startsWith('Wine - ')) {
          result[type] = displayedBeverages.value[type]
        }
      })
      return result
    })

    const beerSubcategories = computed(() => {
      const result = {}
      Object.keys(displayedBeverages.value).forEach(type => {
        if (type.startsWith('Beer - ')) {
          result[type] = displayedBeverages.value[type]
        }
      })
      return result
    })

    const otherBeverages = computed(() => {
      const result = {}
      Object.keys(displayedBeverages.value).forEach(type => {
        if (!type.startsWith('Wine - ') && !type.startsWith('Beer - ')) {
          result[type] = displayedBeverages.value[type]
        }
      })
      return result
    })

    // Computed property to get location number from selected location
    const selectedLocationNumber = computed(() => {
      if (!selectedLocation.value) return null
      return selectedLocation.value.fields?.['Location Number'] || null
    })

    // NEW: Hierarchical beverage organization
    const hierarchicalBeverages = computed(() => {
      if (!data.value) return {}

      // First organize beverages into hierarchical structure with location awareness
      let organized = organizeByHierarchy(data.value, selectedLocationNumber.value)

      // Apply filtering based on current settings
      organized = filterHierarchy(organized, {
        showOnlyAvailable: showOnlyAvailable.value,
        selectedLocationId: selectedLocationId.value,
        locationNumber: selectedLocationNumber.value
      })

      // Apply sorting if needed
      if (sortBy.value.startsWith('price')) {
        const ascending = sortBy.value === 'price-asc'
        organized = sortHierarchyByPrice(organized, ascending)
      }

      return organized
    })

    // NEW: Hierarchical beverage stats
    const hierarchicalStats = computed(() => {
      if (!hierarchicalBeverages.value) return {}
      return getHierarchyStats(hierarchicalBeverages.value)
    })

    // Handle location change from component
    const handleLocationChange = (newLocationId) => {
      setSelectedLocation(newLocationId)
    }

    const loadData = async () => {
      // Load both beverage and location data
      await Promise.all([
        fetchData(),
        fetchLocations()
      ])

      if (!error.value && !locationError.value) {
        lastUpdated.value = new Date().toLocaleString()
      }
    }

    const refreshData = async () => {
      if (isRefreshing.value) return

      isRefreshing.value = true
      refreshMessage.value = ''
      refreshError.value = false

      try {
        const port = import.meta.env.VITE_PORT || 3002
        const response = await fetch(`http://localhost:${port}/api/refresh-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || `HTTP ${response.status}`)
        }

        // Refresh the local data after successful server refresh
        await loadData()

        refreshMessage.value = `✅ Refreshed ${result.stats.beverages} beverages, ${result.stats.locations} locations, ${result.stats.lookupRecords} lookup records`
        refreshError.value = false

        // Clear success message after 5 seconds
        setTimeout(() => {
          refreshMessage.value = ''
        }, 5000)

      } catch (error) {
        console.error('Refresh failed:', error)
        refreshMessage.value = `❌ Refresh failed: ${error.message}`
        refreshError.value = true

        // Clear error message after 8 seconds
        setTimeout(() => {
          refreshMessage.value = ''
        }, 8000)
      } finally {
        isRefreshing.value = false
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      // Beverage data
      data,
      loading,
      error,
      lastUpdated,
      organizedBeverages,
      beverageStats,
      displayedBeverages,
      wineSubcategories,
      beerSubcategories,
      otherBeverages,
      showOnlyAvailable,
      sortBy,

      // Location data
      locations,
      selectedLocationId,
      selectedLocation,
      selectedLocationName,
      activeLocations,
      locationLoading,
      locationError,

      // Event handlers
      handleLocationChange,
      refreshData,

      // Computed stats
      mappingStats,

      // NEW: Hierarchical data
      hierarchicalBeverages,
      hierarchicalStats,

      // Debug mode
      isDebugMode,
      isRefreshing,
      refreshMessage,
      refreshError
    }
  }
}
</script>