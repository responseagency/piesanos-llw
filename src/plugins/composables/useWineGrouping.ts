import { computed, type Ref } from 'vue'
import type { BaseItem } from '@/core/types'

/**
 * Composable for wine-specific grouping logic
 * Groups wines by base name with multiple serving options
 */
export function useWineGrouping(wines: Ref<BaseItem[]>) {

  /**
   * Extract base wine name from full name, including varietal info
   */
  function extractWineBaseName(fullName: string, beverageCategories: string[]): string {
    // Pattern: "Brand Name - Wine [Format] [Size] [Container] : $Price"
    // Extract everything before " - Wine"
    const match = fullName.match(/^(.+?)\s*-\s*Wine/)
    const baseName = match ? match[1].trim() : fullName

    // Include beverage category to distinguish varietals
    const categoryKey = beverageCategories ? beverageCategories.join('|') : 'unknown'
    return `${baseName}__${categoryKey}`
  }

  /**
   * Parse serving size and format from wine name
   */
  function parseWineServing(fullName: string) {
    // Extract format, size, and price
    const formatMatch = fullName.match(/Wine\s+(Glass|Bottle)/)
    const sizeMatch = fullName.match(/(\d+(?:\.\d+)?)\s*oz/)
    const containerMatch = fullName.match(/oz\s+(Glass|Bottle|Mini Bottle)/)
    const priceMatch = fullName.match(/\$(\d+(?:\.\d+)?)/)

    return {
      format: formatMatch ? formatMatch[1] : 'Unknown',
      size: sizeMatch ? parseFloat(sizeMatch[1]) : 0,
      container: containerMatch ? containerMatch[1] : 'Unknown',
      price: priceMatch ? parseFloat(priceMatch[1]) : 0
    }
  }

  /**
   * Group wines by base name with multiple serving options
   */
  const groupedWines = computed(() => {
    const grouped: Record<string, {
      baseName: string
      wines: BaseItem[]
      servings: Array<{
        format: string
        size: number
        container: string
        price: number
        fullRecord: BaseItem
      }>
    }> = {}

    wines.value.forEach(wine => {
      const beverageCategories = wine.metadata?.categoryIds || []
      const groupingKey = extractWineBaseName(wine.name, beverageCategories)
      const serving = parseWineServing(wine.name)

      // Extract display name (without category suffix for UI)
      const displayName = wine.name.match(/^(.+?)\s*-\s*Wine/)
        ? wine.name.match(/^(.+?)\s*-\s*Wine/)![1].trim()
        : wine.name

      if (!grouped[groupingKey]) {
        grouped[groupingKey] = {
          baseName: displayName,
          wines: [],
          servings: []
        }
      }

      grouped[groupingKey].wines.push(wine)
      grouped[groupingKey].servings.push({
        ...serving,
        fullRecord: wine
      })
    })

    // Sort servings by size (glasses first, then bottles)
    Object.keys(grouped).forEach(groupingKey => {
      grouped[groupingKey].servings.sort((a, b) => {
        // Glasses first, then bottles
        if (a.format !== b.format) {
          return a.format === 'Glass' ? -1 : 1
        }
        // Within same format, sort by size
        return a.size - b.size
      })
    })

    return grouped
  })

  /**
   * Get wine statistics
   */
  const wineStats = computed(() => {
    const grouped = groupedWines.value
    const uniqueWines = Object.keys(grouped).length
    const totalItems = wines.value.length

    const priceRanges = Object.values(grouped).map(group => {
      const prices = group.servings.map(s => s.price).filter(p => p > 0)
      return {
        min: Math.min(...prices),
        max: Math.max(...prices),
        avg: prices.reduce((sum, p) => sum + p, 0) / prices.length
      }
    })

    return {
      uniqueWines,
      totalItems,
      avgPriceRange: {
        min: Math.min(...priceRanges.map(r => r.min)),
        max: Math.max(...priceRanges.map(r => r.max)),
        avg: priceRanges.reduce((sum, r) => sum + r.avg, 0) / priceRanges.length
      }
    }
  })

  return {
    groupedWines,
    wineStats,
    extractWineBaseName,
    parseWineServing
  }
}