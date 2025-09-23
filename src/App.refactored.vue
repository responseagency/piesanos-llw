<template>
  <div class="min-h-screen" :style="themeVariables">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-3xl font-bold text-gray-900">{{ config.title }}</h1>
          <div class="flex items-center gap-4">
            <!-- Theme Selector -->
            <select
              v-model="currentThemeName"
              @change="setTheme($event.target.value)"
              class="text-sm border rounded px-2 py-1"
            >
              <option v-for="theme in availableThemes" :key="theme" :value="theme">
                {{ theme.charAt(0).toUpperCase() + theme.slice(1) }} Theme
              </option>
            </select>
            <div class="text-sm text-gray-600">
              Last updated: {{ lastUpdated || 'Never' }}
            </div>
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

      <div v-else-if="sections && sections.length > 0">
        <!-- Summary Stats -->
        <div v-if="config.displayOptions?.showStats" class="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Menu Overview</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{{ stats.totalItems }}</div>
              <div class="text-sm text-gray-600">Total Items</div>
              <div v-if="stats.avgPrice > 0" class="text-xs text-gray-500">
                Avg: ${{ stats.avgPrice }}
              </div>
            </div>
            <div
              v-for="(sectionStat, sectionName) in stats.sections"
              :key="sectionName"
              class="text-center"
            >
              <div class="text-2xl font-bold text-gray-900">{{ sectionStat.totalItems }}</div>
              <div class="text-sm text-gray-600">{{ getSectionDisplayName(sectionName) }}</div>
              <div v-if="sectionStat.avgPrice > 0" class="text-xs text-gray-500">
                Avg: ${{ sectionStat.avgPrice }}
              </div>
            </div>
          </div>

          <!-- Category Mapping Stats -->
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
                <div class="text-lg font-bold text-yellow-600">{{ mappingStats.explicitlyMapped }}</div>
                <div class="text-yellow-700">Manual Mapping</div>
              </div>
              <div class="text-center">
                <div class="text-lg font-bold text-red-600">{{ mappingStats.unmapped }}</div>
                <div class="text-red-700">Unmapped</div>
              </div>
            </div>
            <div v-if="mappingStats.dynamicallyMapped > 0" class="text-xs text-blue-600 mt-2">
              🤖 {{ mappingStats.dynamicallyMapped }} categories automatically detected!
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div v-if="config.displayOptions?.showFilters" class="bg-white rounded-lg shadow-sm border p-4 mb-8">
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
              <span class="text-sm mr-2">Search:</span>
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search items..."
                class="border rounded px-2 py-1 text-sm"
              >
            </label>
            <label v-if="config.displayOptions?.allowSorting" class="flex items-center">
              <span class="text-sm mr-2">Sort by:</span>
              <select v-model="sortBy" class="border rounded px-2 py-1 text-sm">
                <option value="name">Name</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
              </select>
            </label>
          </div>
        </div>

        <!-- Menu Sections -->
        <div class="space-y-8">
          <!-- Use plugin-specific components if available -->
          <component
            v-for="section in sections"
            :key="section.id"
            :is="getSectionComponent(section)"
            :section="section"
            :config="config"
            :category-mapping="categoryMapping"
          />
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-600">No menu items available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useGenericMenu } from '@/composables/useGenericMenu'
import { useCategoryMapping } from '@/composables/useCategoryMapping'
import { useTheme } from '@/composables/useTheme'
import { pluginManager } from '@/plugins/PluginManager'
import { AirtableAdapter } from '@/adapters/AirtableAdapter'
import { beverageMenuConfig } from '@/configs/beverageConfig'
import beveragePlugin from '@/plugins/BeveragePlugin'
import GenericMenuSection from '@/components/GenericMenuSection.vue'

// Register plugins and adapters
pluginManager.registerPlugin(beveragePlugin)

// Setup adapters
const airtableAdapter = AirtableAdapter.fromEnvironment()
pluginManager.registerAdapter(airtableAdapter)

// Use the configuration (could be dynamic based on URL params, etc.)
const config = beverageMenuConfig

// Setup menu system
const {
  items,
  categories,
  sections,
  loading,
  error,
  lastUpdated,
  showOnlyAvailable,
  sortBy,
  searchQuery,
  stats,
  fetchData
} = useGenericMenu(airtableAdapter, config)

// Setup category mapping
const { getCategoryName, mappingStats, dynamicCategoryMapping } = useCategoryMapping(
  items,
  categories,
  config
)

// Setup theme system
const {
  currentThemeName,
  availableThemes,
  themeVariables,
  setTheme,
  getSectionBorderColor,
  getCategoryBadgeClasses
} = useTheme()

// Set initial theme based on config
onMounted(() => {
  const themeName = config.displayOptions?.theme || 'beverage'
  setTheme(themeName)
  fetchData()
})

// Computed properties
const categoryMapping = computed(() => {
  return dynamicCategoryMapping.value
})

/**
 * Get the appropriate component for a section
 * Uses plugin-specific components if available, falls back to generic
 */
function getSectionComponent(section: any) {
  const activePlugin = pluginManager.getActivePlugin()

  if (activePlugin?.customComponents) {
    // For beverage plugin, use BeverageSection for beverage sections
    if (activePlugin.name === 'beverage-menu' &&
        (section.name.includes('wine') || section.name.includes('beer') || section.name.includes('cocktail'))) {
      return activePlugin.customComponents.BeverageSection
    }
  }

  // Fallback to generic component
  return GenericMenuSection
}

/**
 * Get display name for section stats
 */
function getSectionDisplayName(sectionName: string): string {
  return sectionName.replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^./, str => str.toUpperCase())
    .replace(' - ', ' ')
}
</script>