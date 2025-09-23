/**
 * @fileoverview Configuration-driven menu composable
 * Replaces hardcoded logic with flexible, configuration-based menu management
 */

import { ref, computed, provide } from 'vue'
import { AirtableDataAdapter } from '../adapters/AirtableDataAdapter.js'
import { MenuCategorizationEngine } from '../engines/MenuCategorizationEngine.js'
import { beverageMenuConfig } from '../config/menuConfig.js'

/**
 * @typedef {Object} MenuState
 * @property {Array} data - Raw menu data
 * @property {boolean} loading - Loading state
 * @property {string|null} error - Error message
 * @property {string|null} lastUpdated - Last update timestamp
 * @property {Object} categorizedData - Data organized by categories
 * @property {Object} stats - Menu statistics
 * @property {Object} filters - Active filters
 */

/**
 * Configuration-driven menu composable
 * Provides a flexible, reusable interface for menu systems
 *
 * @param {Object} [config] - Menu configuration (defaults to beverageMenuConfig)
 * @returns {Object} Menu management interface
 */
export function useConfigurableMenu(config = beverageMenuConfig) {
  // Core state
  const data = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdated = ref(null)

  // Filter and display state
  const showOnlyAvailable = ref(false)
  const sortBy = ref('name')
  const activeFilters = ref({})

  // Initialize adapters and engines
  const dataAdapter = new AirtableDataAdapter(config.dataAdapter)
  const categorizationEngine = new MenuCategorizationEngine(config)

  /**
   * Fetch menu data using the configured adapter
   * @param {boolean} [forceRefresh=false] - Force refresh cache
   */
  const fetchData = async (forceRefresh = false) => {
    loading.value = true
    error.value = null

    try {
      const result = await dataAdapter.getData(forceRefresh)
      data.value = result
      lastUpdated.value = new Date().toLocaleString()
    } catch (err) {
      error.value = err.message || 'Failed to fetch menu data'
      console.error('Error in useConfigurableMenu:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Categorized menu data based on configuration
   */
  const categorizedData = computed(() => {
    if (!data.value?.length) return {}

    const categorized = categorizationEngine.categorizeItems(data.value)

    // Apply filters if any are active
    if (showOnlyAvailable.value) {
      return filterByAvailability(categorized)
    }

    return categorized
  })

  /**
   * Menu statistics based on categorized data
   */
  const menuStats = computed(() => {
    const stats = {}
    const categorized = categorizedData.value

    Object.keys(categorized).forEach(menuType => {
      Object.keys(categorized[menuType]).forEach(category => {
        const items = categorized[menuType][category]
        const categoryKey = `${menuType}-${category}`

        const prices = items.map(item => item.price || 0).filter(p => p > 0)

        stats[categoryKey] = {
          count: items.length,
          avgPrice: prices.length > 0
            ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)
            : 0,
          minPrice: prices.length > 0 ? Math.min(...prices) : 0,
          maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
          available: items.filter(item => item.available).length
        }
      })
    })

    return stats
  })

  /**
   * Categorization statistics from the engine
   */
  const categorizationStats = computed(() => {
    return categorizationEngine.getStats()
  })

  /**
   * Menu data organized for display based on configuration
   */
  const displayData = computed(() => {
    const categorized = categorizedData.value
    const ordered = {}

    // Use configured display order
    config.displayOrder.forEach(menuType => {
      if (categorized[menuType] && Object.keys(categorized[menuType]).length > 0) {
        ordered[menuType] = {}

        // Sort categories within menu type by their order configuration
        const menuTypeConfig = config.menuTypes[menuType]
        if (menuTypeConfig) {
          const sortedCategories = Object.keys(categorized[menuType]).sort((a, b) => {
            const orderA = menuTypeConfig.categories[a]?.order || 999
            const orderB = menuTypeConfig.categories[b]?.order || 999
            return orderA - orderB
          })

          sortedCategories.forEach(category => {
            if (categorized[menuType][category]?.length > 0) {
              ordered[menuType][category] = applySorting(
                categorized[menuType][category],
                sortBy.value
              )
            }
          })
        }
      }
    })

    // Add any menu types not in the configured display order
    Object.keys(categorized).forEach(menuType => {
      if (!config.displayOrder.includes(menuType) &&
          Object.keys(categorized[menuType]).length > 0) {
        ordered[menuType] = categorized[menuType]
      }
    })

    return ordered
  })

  /**
   * Grouped data for specific menu types (e.g., wine subcategories)
   */
  const getMenuTypeData = computed(() => (menuType) => {
    const result = {}
    Object.keys(displayData.value).forEach(type => {
      if (type.startsWith(`${menuType}-`) || type === menuType) {
        result[type] = displayData.value[type]
      }
    })
    return result
  })

  /**
   * Apply availability filtering
   * @param {Object} categorized - Categorized menu data
   * @returns {Object} Filtered data
   */
  const filterByAvailability = (categorized) => {
    const filtered = {}

    Object.keys(categorized).forEach(menuType => {
      filtered[menuType] = {}
      Object.keys(categorized[menuType]).forEach(category => {
        const availableItems = categorized[menuType][category].filter(item => item.available)
        if (availableItems.length > 0) {
          filtered[menuType][category] = availableItems
        }
      })
    })

    return filtered
  }

  /**
   * Apply sorting to items
   * @param {Array} items - Items to sort
   * @param {string} sortMethod - Sort method ('name', 'price-asc', 'price-desc')
   * @returns {Array} Sorted items
   */
  const applySorting = (items, sortMethod) => {
    const sorted = [...items]

    switch (sortMethod) {
      case 'price-asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
      case 'price-desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
      case 'name':
      default:
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    }
  }

  /**
   * Get category styling configuration
   * @param {string} menuType - Menu type key
   * @param {string} category - Category key
   * @returns {Object|null} Styling configuration
   */
  const getCategoryStyling = (menuType, category) => {
    return categorizationEngine.getCategoryStyling(menuType, category)
  }

  /**
   * Get human-readable category label
   * @param {string} menuType - Menu type key
   * @param {string} category - Category key
   * @returns {string} Human-readable label
   */
  const getCategoryLabel = (menuType, category) => {
    return categorizationEngine.getCategoryLabel(menuType, category)
  }

  /**
   * Check if a feature is enabled in the configuration
   * @param {string} feature - Feature key
   * @returns {boolean} True if enabled
   */
  const isFeatureEnabled = (feature) => {
    return config.features[feature] || false
  }

  /**
   * Get theme configuration
   * @returns {Object} Theme configuration
   */
  const getTheme = () => {
    return config.theme
  }

  /**
   * Clear data adapter cache
   */
  const clearCache = () => {
    dataAdapter.clearCache()
  }

  /**
   * Get adapter statistics
   * @returns {Object} Adapter statistics
   */
  const getAdapterStats = () => {
    return dataAdapter.getCacheStats()
  }

  // Provide menu context to child components
  provide('configurableMenu', {
    // Core data
    data,
    loading,
    error,
    categorizedData,
    displayData,

    // Statistics
    menuStats,
    categorizationStats,

    // Utilities
    getCategoryStyling,
    getCategoryLabel,
    isFeatureEnabled,
    getTheme,

    // Configuration
    config
  })

  // Return the composable interface
  return {
    // Core state
    data,
    loading,
    error,
    lastUpdated,

    // Processed data
    categorizedData,
    displayData,
    menuStats,
    categorizationStats,

    // Filters and controls
    showOnlyAvailable,
    sortBy,
    activeFilters,

    // Methods
    fetchData,
    clearCache,
    getAdapterStats,
    getMenuTypeData,
    getCategoryStyling,
    getCategoryLabel,
    isFeatureEnabled,
    getTheme,

    // Configuration access
    config
  }
}