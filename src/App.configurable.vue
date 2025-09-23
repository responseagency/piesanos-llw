<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900">{{ config.name }}</h1>
          <div v-if="isFeatureEnabled('showLastUpdated')" class="text-sm text-gray-600">
            Last updated: {{ lastUpdated || 'Never' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 py-8">
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Loading menu...</p>
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 class="text-red-800 font-semibold">Error Loading Data</h3>
        <p class="text-red-600 mt-1">{{ error }}</p>
      </div>

      <div v-else-if="displayData && Object.keys(displayData).length > 0">
        <!-- Configuration-Driven Stats -->
        <div v-if="isFeatureEnabled('enableStats')" class="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Menu Overview</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div
              v-for="(stats, categoryKey) in menuStats"
              :key="categoryKey"
              class="text-center"
            >
              <div class="text-2xl font-bold text-gray-900">{{ stats.count }}</div>
              <div class="text-sm text-gray-600">{{ getCategoryDisplayName(categoryKey) }}</div>
              <div v-if="stats.avgPrice > 0" class="text-xs text-gray-500">
                Avg: ${{ stats.avgPrice }}
              </div>
            </div>
          </div>

          <!-- Categorization Analytics -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-blue-800 mb-2">Smart Categorization Analytics</h3>
            <div class="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div class="text-center">
                <div class="text-lg font-bold text-blue-600">{{ categorizationStats.total }}</div>
                <div class="text-blue-700">Total Items</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-green-600">{{ categorizationStats.byKeyword }}</div>
                <div class="text-green-700">By Keywords</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-yellow-600">{{ categorizationStats.byLegacy }}</div>
                <div class="text-yellow-700">Legacy Mapping</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-purple-600">{{ categorizationStats.byInference }}</div>
                <div class="text-purple-700">Inferred</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-red-600">{{ categorizationStats.fallback }}</div>
                <div class="text-red-700">Fallback</div>
              </div>
            </div>
            <div v-if="categorizationStats.byKeyword > 0" class="text-xs text-blue-600 mt-2">
              🤖 {{ categorizationStats.byKeyword }} items automatically categorized by intelligent keyword matching!
            </div>
          </div>
        </div>

        <!-- Configuration-Driven Filter Controls -->
        <div v-if="isFeatureEnabled('enableFiltering')" class="bg-white rounded-lg shadow-sm border p-4 mb-8">
          <div class="flex flex-wrap gap-4 items-center">
            <label v-if="isFeatureEnabled('enableAvailabilityFilter')" class="flex items-center">
              <input
                v-model="showOnlyAvailable"
                type="checkbox"
                class="mr-2"
              >
              <span class="text-sm">Show only available items</span>
            </label>
            <label v-if="isFeatureEnabled('enableSorting')" class="flex items-center">
              <span class="text-sm mr-2">Sort by:</span>
              <select v-model="sortBy" class="border rounded px-2 py-1 text-sm">
                <option value="name">Name</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </label>
          </div>
        </div>

        <!-- Configuration-Driven Menu Sections -->
        <div :class="getTheme().spacing.section">
          <!-- Iterate through menu types in configured order -->
          <div
            v-for="(menuTypeData, menuType) in displayData"
            :key="menuType"
            class="space-y-6"
          >
            <!-- Wine Section (Special Handling) -->
            <div v-if="menuType === 'wine'" class="space-y-4">
              <div class="bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                  {{ getMenuTypeConfig(menuType)?.label || 'Wine' }}
                </h2>
                <div class="space-y-6">
                  <div
                    v-for="(items, category) in menuTypeData"
                    :key="`${menuType}-${category}`"
                    :class="[getCategoryStyling(menuType, category)?.headerColor || 'bg-gray-50', 'rounded-lg border p-4']"
                  >
                    <h3 :class="[getCategoryStyling(menuType, category)?.textColor || 'text-gray-800', 'text-lg font-semibold mb-4']">
                      {{ getCategoryStyling(menuType, category)?.label || category }}
                    </h3>
                    <div class="grid gap-3">
                      <div
                        v-for="item in items"
                        :key="item.id"
                        class="bg-white rounded border p-3 hover:shadow-sm transition-shadow"
                      >
                        <div class="flex justify-between items-start">
                          <div class="flex-1">
                            <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                            <div v-if="item._categorization" class="text-xs text-gray-500 mt-1">
                              Confidence: {{ Math.round(item._categorization.confidence * 100) }}%
                              via {{ item._categorization.method }}
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="font-semibold text-gray-900">${{ item.price }}</div>
                            <div v-if="!item.available" class="text-xs text-red-600">Unavailable</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Beer Section (Special Handling) -->
            <div v-else-if="menuType === 'beer'" class="space-y-4">
              <div class="bg-white rounded-lg shadow-sm border p-6">
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                  {{ getMenuTypeConfig(menuType)?.label || 'Beer' }}
                </h2>
                <div class="space-y-6">
                  <div
                    v-for="(items, category) in menuTypeData"
                    :key="`${menuType}-${category}`"
                    :class="[getCategoryStyling(menuType, category)?.headerColor || 'bg-gray-50', 'rounded-lg border p-4']"
                  >
                    <h3 :class="[getCategoryStyling(menuType, category)?.textColor || 'text-gray-800', 'text-lg font-semibold mb-4']">
                      {{ getCategoryConfig(menuType, category)?.label || category }}
                    </h3>
                    <div class="grid gap-3">
                      <div
                        v-for="item in items"
                        :key="item.id"
                        class="bg-white rounded border p-3 hover:shadow-sm transition-shadow"
                      >
                        <div class="flex justify-between items-start">
                          <div class="flex-1">
                            <h4 class="font-medium text-gray-900">{{ item.name }}</h4>
                            <div v-if="item._categorization" class="text-xs text-gray-500 mt-1">
                              Auto-detected: {{ item._categorization.method }}
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="font-semibold text-gray-900">${{ item.price }}</div>
                            <div v-if="!item.available" class="text-xs text-red-600">Unavailable</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Generic Menu Type Sections -->
            <div v-else class="space-y-4">
              <div
                v-for="(items, category) in menuTypeData"
                :key="`${menuType}-${category}`"
                class="bg-white rounded-lg shadow-sm border p-6"
              >
                <h2 class="text-2xl font-bold text-gray-900 mb-6">
                  {{ getCategoryLabel(menuType, category) }}
                </h2>
                <div class="grid gap-3">
                  <div
                    v-for="item in items"
                    :key="item.id"
                    class="border rounded p-4 hover:shadow-sm transition-shadow"
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h3 class="font-medium text-gray-900">{{ item.name }}</h3>
                        <div v-if="item._categorization && item._categorization.method !== 'legacy'" class="text-xs text-gray-500 mt-1">
                          Smart categorization: {{ item._categorization.confidence * 100 | 0 }}% confidence
                        </div>
                      </div>
                      <div class="text-right">
                        <div class="font-semibold text-gray-900">${{ item.price }}</div>
                        <div v-if="!item.available" class="text-xs text-red-600">Unavailable</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-600">No menu items available</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, onMounted } from 'vue'
import { useConfigurableMenu } from './composables/useConfigurableMenu.js'
import { getMenuTypeConfig, getCategoryConfig } from './config/menuConfig.js'

export default {
  name: 'ConfigurableApp',
  setup() {
    const menu = useConfigurableMenu()

    const {
      data,
      loading,
      error,
      lastUpdated,
      displayData,
      menuStats,
      categorizationStats,
      showOnlyAvailable,
      sortBy,
      fetchData,
      getCategoryStyling,
      getCategoryLabel,
      isFeatureEnabled,
      getTheme,
      config
    } = menu

    // Helper function to get menu type configuration
    const getMenuTypeConfig = (menuType) => {
      return config.menuTypes[menuType] || null
    }

    // Helper function to get category display name for stats
    const getCategoryDisplayName = (categoryKey) => {
      const [menuType, category] = categoryKey.split('-')
      return getCategoryLabel(menuType, category)
    }

    const loadData = async () => {
      await fetchData()
    }

    onMounted(() => {
      loadData()
    })

    return {
      // Core state
      data,
      loading,
      error,
      lastUpdated,

      // Processed data
      displayData,
      menuStats,
      categorizationStats,

      // Controls
      showOnlyAvailable,
      sortBy,

      // Utilities
      getCategoryStyling,
      getCategoryLabel,
      getCategoryDisplayName,
      isFeatureEnabled,
      getTheme,
      getMenuTypeConfig,
      getCategoryConfig,

      // Configuration
      config
    }
  }
}
</script>