<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900">Beverage Menu</h1>
          <div class="text-sm text-gray-600">
            Last updated: {{ lastUpdated || 'Never' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading beverages...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-semibold">Error Loading Data</h3>
        <p class="text-red-600 mt-1">{{ error }}</p>
      </div>

      <div v-else-if="organizedBeverages && Object.keys(organizedBeverages).length > 0">
        <!-- Summary Stats -->
        <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Menu Overview</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div
              v-for="(stats, type) in beverageStats"
              :key="type"
              class="text-center"
            >
              <div class="text-2xl font-bold text-gray-900">{{ stats.count }}</div>
              <div class="text-sm text-gray-600">{{ type }}</div>
              <div v-if="stats.avgPrice > 0" class="text-xs text-gray-500">
                Avg: ${{ stats.avgPrice }}
              </div>
            </div>
          </div>

          <!-- Dynamic Category Mapping Stats -->
          <div v-if="mappingStats" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-blue-800 mb-2">Smart Category Mapping</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="text-center">
                <div class="text-lg font-bold text-blue-600">{{ mappingStats.totalCategories }}</div>
                <div class="text-blue-700">Total Categories</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">{{ mappingStats.dynamicallyMapped }}</div>
                <div class="text-green-700">Auto-Detected</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-yellow-600">{{ mappingStats.fallbackMapped }}</div>
                <div class="text-yellow-700">Manual Mapping</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-red-600">{{ mappingStats.unmapped }}</div>
                <div class="text-red-700">Unmapped</div>
              </div>
            </div>
            <div v-if="mappingStats.dynamicallyMapped > 0" class="text-xs text-blue-600 mt-2">
              🤖 {{ mappingStats.dynamicallyMapped }} categories automatically detected from beverage names!
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <div class="flex flex-wrap gap-4 items-center">
            <label class="flex items-center">
              <input
                v-model="showOnlyAvailable"
                type="checkbox"
                class="mr-2"
              >
              <span class="text-sm">Show only available items</span>
            </label>
            <label class="flex items-center">
              <span class="text-sm mr-2">Sort by:</span>
              <select v-model="sortBy" class="border rounded px-2 py-1 text-sm">
                <option value="name">Name</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </label>
          </div>
        </div>

        <!-- Beverage Sections -->
        <div class="space-y-8">
          <!-- Wine Section (grouped) -->
          <WineSection
            v-if="wineSubcategories && Object.keys(wineSubcategories).length > 0"
            :wine-subcategories="wineSubcategories"
            :stats="beverageStats"
          />

          <!-- Beer Section (grouped) -->
          <BeerSection
            v-if="beerSubcategories && Object.keys(beerSubcategories).length > 0"
            :beer-subcategories="beerSubcategories"
            :stats="beverageStats"
          />

          <!-- Other Beverage Sections -->
          <BeverageSection
            v-for="(beverages, type) in otherBeverages"
            :key="type"
            :type="type"
            :beverages="beverages"
            :stats="beverageStats[type] || {}"
            :hide-glass-info="type === 'Cocktails'"
            :show-format-info="!['Cocktails', 'Hard Seltzer'].includes(type)"
          />
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-600">No beverages available</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, provide } from 'vue'
import { useAirtable } from './composables/useAirtable'
import { useDynamicCategoryMapping } from './composables/useDynamicCategoryMapping'
import BeverageSection from './components/BeverageSection.vue'
import WineSection from './components/WineSection.vue'
import BeerSection from './components/BeerSection.vue'
import {
  groupBeveragesByType,
  sortBeveragesByPrice,
  filterAvailableBeverages,
  getBeverageStats
} from './utils/beverageOrganizer'

export default {
  name: 'App',
  components: {
    BeverageSection,
    WineSection,
    BeerSection
  },
  setup() {
    const { data, loading, error, fetchData } = useAirtable()
    const { getCategoryName, dynamicCategoryMapping, mappingStats } = useDynamicCategoryMapping(data)
    const lastUpdated = ref(null)
    const showOnlyAvailable = ref(false)
    const sortBy = ref('name')

    // Provide the dynamic category mapping to child components
    provide('categoryMapping', {
      getCategoryName,
      dynamicMapping: dynamicCategoryMapping,
      stats: mappingStats
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
      let beverages = { ...organizedBeverages.value }

      // Filter by availability if requested
      if (showOnlyAvailable.value) {
        beverages = filterAvailableBeverages(beverages)
      }

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

    const loadData = async () => {
      await fetchData()
      if (!error.value) {
        lastUpdated.value = new Date().toLocaleString()
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
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
      sortBy
    }
  }
}
</script>