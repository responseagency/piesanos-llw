import { computed, ref, type Ref } from 'vue'
import type { BaseItem, Category, MenuConfig, CategoryMappingRule } from '../core/types'

/**
 * Modular composable for dynamic category mapping
 * Replaces the beverage-specific category mapping with configurable rules
 */
export function useCategoryMapping(
  items: Ref<BaseItem[]>,
  categories: Ref<Category[]>,
  config: MenuConfig
) {
  const fallbackMapping = ref<Record<string, string>>({})

  /**
   * Extract category name from item using configured rules
   */
  function extractCategoryFromItem(item: BaseItem, rules: CategoryMappingRule[]): string | null {
    for (const rule of rules) {
      const fieldValue = getFieldValue(item, rule.field)
      if (!fieldValue) continue

      for (const { pattern, categoryName } of rule.patterns) {
        if (pattern.test(fieldValue)) {
          return categoryName
        }
      }
    }
    return null
  }

  /**
   * Get field value from item for pattern matching
   */
  function getFieldValue(item: BaseItem, field: string): string {
    switch (field) {
      case 'name':
        return item.name || ''
      case 'description':
        return item.description || ''
      case 'type':
        return item.metadata?.type || ''
      default:
        return item.metadata?.[field] || ''
    }
  }

  /**
   * Create dynamic category mapping based on items and rules
   */
  const dynamicCategoryMapping = computed(() => {
    const mapping: Record<string, string> = { ...fallbackMapping.value }
    const analysisLog = new Map<string, { extractedName: string; examples: string[] }>()

    items.value.forEach(item => {
      const categoryIds = item.metadata?.categoryIds || []

      categoryIds.forEach((categoryId: string) => {
        if (mapping[categoryId]) return // Already mapped

        // Try to extract category name using rules
        const extractedName = extractCategoryFromItem(item, config.categoryRules)

        if (extractedName) {
          mapping[categoryId] = extractedName

          // Track for analysis
          if (!analysisLog.has(categoryId)) {
            analysisLog.set(categoryId, {
              extractedName,
              examples: []
            })
          }
          analysisLog.get(categoryId)!.examples.push(item.name)
        }
      })
    })

    // Log analysis in development
    if (import.meta.env.DEV && analysisLog.size > 0) {
      console.log('Dynamic category mapping analysis:', Object.fromEntries(analysisLog))
    }

    return mapping
  })

  /**
   * Get readable name for a category ID
   */
  function getCategoryName(categoryId: string): string {
    if (!categoryId) return 'Unknown Category'

    const mapping = dynamicCategoryMapping.value
    const mappedName = mapping[categoryId]

    if (mappedName) return mappedName

    // Try to find in explicit categories
    const category = categories.value.find(cat => cat.id === categoryId)
    if (category) return category.displayName || category.name

    // Fallback to short ID
    return `Category ${categoryId.slice(-6)}`
  }

  /**
   * Get mapping statistics
   */
  const mappingStats = computed(() => {
    if (!items.value.length) {
      return {
        totalCategories: 0,
        dynamicallyMapped: 0,
        explicitlyMapped: 0,
        unmapped: 0
      }
    }

    const allCategoryIds = new Set<string>()
    items.value.forEach(item => {
      const categoryIds = item.metadata?.categoryIds || []
      categoryIds.forEach((id: string) => allCategoryIds.add(id))
    })

    const mapping = dynamicCategoryMapping.value
    let dynamicallyMapped = 0
    let explicitlyMapped = 0
    let unmapped = 0

    allCategoryIds.forEach(id => {
      if (mapping[id]) {
        if (fallbackMapping.value[id]) {
          explicitlyMapped++
        } else {
          dynamicallyMapped++
        }
      } else {
        unmapped++
      }
    })

    return {
      totalCategories: allCategoryIds.size,
      dynamicallyMapped,
      explicitlyMapped,
      unmapped
    }
  })

  /**
   * Set fallback mapping for categories that can't be auto-detected
   */
  function setFallbackMapping(mapping: Record<string, string>) {
    fallbackMapping.value = { ...mapping }
  }

  /**
   * Add a single fallback mapping
   */
  function addFallbackMapping(categoryId: string, name: string) {
    fallbackMapping.value[categoryId] = name
  }

  /**
   * Get all discovered categories with their mappings
   */
  const discoveredCategories = computed(() => {
    const mapping = dynamicCategoryMapping.value
    const discovered: Record<string, string> = {}
    const explicit: Record<string, string> = {}

    Object.entries(mapping).forEach(([id, name]) => {
      if (fallbackMapping.value[id]) {
        explicit[id] = name
      } else {
        discovered[id] = name
      }
    })

    return { discovered, explicit }
  })

  return {
    getCategoryName,
    dynamicCategoryMapping,
    mappingStats,
    discoveredCategories,
    setFallbackMapping,
    addFallbackMapping,
    extractCategoryFromItem
  }
}