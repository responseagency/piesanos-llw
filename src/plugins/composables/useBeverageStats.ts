import { computed, type Ref } from 'vue'
import type { BaseItem, MenuSection } from '@/core/types'

/**
 * Composable for beverage-specific statistics and analysis
 */
export function useBeverageStats(
  sections: Ref<MenuSection[]>,
  items: Ref<BaseItem[]>
) {

  /**
   * Overall beverage statistics
   */
  const overallStats = computed(() => {
    const allItems = items.value
    const prices = allItems.map(item => item.price).filter(p => p && p > 0) as number[]
    const availableItems = allItems.filter(item => item.isAvailable !== false)

    return {
      totalBeverages: allItems.length,
      availableBeverages: availableItems.length,
      avgPrice: prices.length > 0 ? (prices.reduce((sum, p) => sum + p, 0) / prices.length).toFixed(2) : '0.00',
      priceRange: prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices)
      } : { min: 0, max: 0 }
    }
  })

  /**
   * Statistics by section
   */
  const sectionStats = computed(() => {
    const stats: Record<string, any> = {}

    sections.value.forEach(section => {
      const sectionItems = section.groups.flatMap(group => group.items)
      const prices = sectionItems.map(item => item.price).filter(p => p && p > 0) as number[]
      const availableItems = sectionItems.filter(item => item.isAvailable !== false)

      // Special handling for wine sections
      let uniqueCount = sectionItems.length
      if (section.name.includes('wine')) {
        // Count unique wine groups instead of individual servings
        const wineGroups = new Set<string>()
        sectionItems.forEach(item => {
          const baseName = item.name.match(/^(.+?)\s*-\s*Wine/)?.[1] || item.name
          const categoryKey = (item.metadata?.categoryIds || []).join('|')
          wineGroups.add(`${baseName}__${categoryKey}`)
        })
        uniqueCount = wineGroups.size
      }

      stats[section.name] = {
        totalItems: sectionItems.length,
        uniqueItems: uniqueCount,
        availableItems: availableItems.length,
        avgPrice: prices.length > 0 ? (prices.reduce((sum, p) => sum + p, 0) / prices.length).toFixed(2) : '0.00',
        priceRange: prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices)
        } : { min: 0, max: 0 },
        groups: section.groups.length
      }
    })

    return stats
  })

  /**
   * Category distribution analysis
   */
  const categoryDistribution = computed(() => {
    const distribution: Record<string, number> = {}

    items.value.forEach(item => {
      const categoryIds = item.metadata?.categoryIds || []
      categoryIds.forEach((id: string) => {
        distribution[id] = (distribution[id] || 0) + 1
      })
    })

    return Object.entries(distribution)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10) // Top 10 categories
  })

  /**
   * Price distribution by ranges
   */
  const priceDistribution = computed(() => {
    const ranges = [
      { label: 'Under $10', min: 0, max: 10 },
      { label: '$10-15', min: 10, max: 15 },
      { label: '$15-25', min: 15, max: 25 },
      { label: '$25-50', min: 25, max: 50 },
      { label: 'Over $50', min: 50, max: Infinity }
    ]

    const distribution = ranges.map(range => ({
      ...range,
      count: items.value.filter(item => {
        const price = item.price || 0
        return price >= range.min && price < range.max
      }).length
    }))

    return distribution
  })

  /**
   * Availability analysis
   */
  const availabilityAnalysis = computed(() => {
    const total = items.value.length
    const available = items.value.filter(item => item.isAvailable !== false).length
    const unavailable = total - available

    return {
      total,
      available,
      unavailable,
      availabilityRate: total > 0 ? ((available / total) * 100).toFixed(1) : '0'
    }
  })

  /**
   * Format statistics for display
   */
  const formatStats = computed(() => {
    const formatCounts: Record<string, number> = {}

    items.value.forEach(item => {
      const name = item.name.toLowerCase()

      // Determine format from name
      let format = 'other'
      if (name.includes('glass') || name.includes('draught') || name.includes('draft')) {
        format = 'draught'
      } else if (name.includes('bottle')) {
        format = 'bottle'
      } else if (name.includes('can')) {
        format = 'can'
      }

      formatCounts[format] = (formatCounts[format] || 0) + 1
    })

    return formatCounts
  })

  return {
    overallStats,
    sectionStats,
    categoryDistribution,
    priceDistribution,
    availabilityAnalysis,
    formatStats
  }
}