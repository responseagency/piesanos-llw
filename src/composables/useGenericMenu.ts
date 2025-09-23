import { ref, computed, provide, inject, type Ref } from 'vue'
import type {
  BaseItem,
  Category,
  MenuSection,
  MenuConfig,
  DataAdapter,
  MenuData
} from '../core/types'
import { MenuOrganizer } from '../core/MenuOrganizer'

// Injection key for menu context
export const MENU_CONTEXT_KEY = Symbol('menu-context')

interface MenuContext {
  config: Ref<MenuConfig>
  items: Ref<BaseItem[]>
  categories: Ref<Category[]>
  sections: Ref<MenuSection[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  stats: Ref<Record<string, any>>
}

/**
 * Generic menu composable that works with any data source and menu type
 * Replaces the beverage-specific logic with configurable patterns
 */
export function useGenericMenu(adapter: DataAdapter, config: MenuConfig) {
  const rawData = ref<any[]>([])
  const items = ref<BaseItem[]>([])
  const categories = ref<Category[]>([])
  const sections = ref<MenuSection[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)

  // Filters and sorting
  const showOnlyAvailable = ref(false)
  const sortBy = ref<'name' | 'price-asc' | 'price-desc'>('name')
  const searchQuery = ref('')

  // Create organizer instance
  const organizer = new MenuOrganizer(config)

  /**
   * Fetch and process data
   */
  async function fetchData() {
    loading.value = true
    error.value = null

    try {
      // Fetch raw data from adapter
      rawData.value = await adapter.fetchData()

      // Transform data using adapter
      items.value = adapter.transformToBaseItems(rawData.value, config)
      categories.value = adapter.mapCategories(rawData.value, config)

      // Organize into sections
      sections.value = organizer.organizeIntoSections(items.value, categories.value)

      lastUpdated.value = new Date().toLocaleString()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error fetching menu data:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Filtered and sorted items
   */
  const processedSections = computed(() => {
    let processed = [...sections.value]

    // Apply filters
    if (showOnlyAvailable.value || searchQuery.value) {
      processed = processed.map(section => ({
        ...section,
        groups: section.groups.map(group => ({
          ...group,
          items: group.items.filter(item => {
            // Availability filter
            if (showOnlyAvailable.value && !item.isAvailable) {
              return false
            }

            // Search filter
            if (searchQuery.value) {
              const query = searchQuery.value.toLowerCase()
              return item.name.toLowerCase().includes(query) ||
                     item.description?.toLowerCase().includes(query)
            }

            return true
          })
        })).filter(group => group.items.length > 0)
      })).filter(section => section.groups.length > 0)
    }

    // Apply sorting
    if (sortBy.value !== 'name') {
      const ascending = sortBy.value === 'price-asc'
      processed = processed.map(section => ({
        ...section,
        groups: section.groups.map(group => ({
          ...group,
          items: [...group.items].sort((a, b) => {
            const priceA = a.price || 0
            const priceB = b.price || 0
            return ascending ? priceA - priceB : priceB - priceA
          })
        }))
      }))
    }

    return processed
  })

  /**
   * Statistics about the menu
   */
  const stats = computed(() => {
    const allItems = items.value
    const totalItems = allItems.length
    const availableItems = allItems.filter(item => item.isAvailable).length
    const prices = allItems.map(item => item.price).filter(p => p && p > 0)

    const sectionStats: Record<string, any> = {}
    sections.value.forEach(section => {
      const sectionItems = section.groups.flatMap(group => group.items)
      const sectionPrices = sectionItems.map(item => item.price).filter(p => p && p > 0)

      sectionStats[section.name] = {
        count: sectionItems.length,
        avgPrice: sectionPrices.length > 0
          ? (sectionPrices.reduce((sum, price) => sum + price, 0) / sectionPrices.length).toFixed(2)
          : 0,
        minPrice: sectionPrices.length > 0 ? Math.min(...sectionPrices) : 0,
        maxPrice: sectionPrices.length > 0 ? Math.max(...sectionPrices) : 0
      }
    })

    return {
      totalItems,
      availableItems,
      avgPrice: prices.length > 0
        ? (prices.reduce((sum, price) => sum + price, 0) / prices.length).toFixed(2)
        : 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
      sections: sectionStats
    }
  })

  /**
   * Category mapping for dynamic names
   */
  const categoryMapping = computed(() => {
    const mapping: Record<string, string> = {}
    categories.value.forEach(category => {
      mapping[category.id] = category.name
    })
    return mapping
  })

  // Provide context for child components
  const menuContext: MenuContext = {
    config: ref(config),
    items,
    categories,
    sections: processedSections,
    loading,
    error,
    stats
  }

  provide(MENU_CONTEXT_KEY, menuContext)

  return {
    // Data
    items,
    categories,
    sections: processedSections,
    rawData,

    // State
    loading,
    error,
    lastUpdated,

    // Filters
    showOnlyAvailable,
    sortBy,
    searchQuery,

    // Computed
    stats,
    categoryMapping,

    // Methods
    fetchData,

    // Config
    config: ref(config),
    organizer
  }
}

/**
 * Inject menu context in child components
 */
export function useMenuContext() {
  const context = inject<MenuContext>(MENU_CONTEXT_KEY)
  if (!context) {
    throw new Error('useMenuContext must be used within a menu provider')
  }
  return context
}