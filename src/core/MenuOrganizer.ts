import type {
  BaseItem,
  Category,
  MenuSection,
  ItemGroup,
  MenuConfig,
  GroupingRule
} from './types'

/**
 * Organizes menu items into sections and groups based on configuration rules
 * Replaces the hardcoded beverage organization logic
 */
export class MenuOrganizer {
  private config: MenuConfig

  constructor(config: MenuConfig) {
    this.config = config
  }

  /**
   * Organize items into menu sections based on grouping rules
   */
  organizeIntoSections(items: BaseItem[], categories: Category[]): MenuSection[] {
    const sections: MenuSection[] = []
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

    // Group items by their matching rules
    for (const rule of this.config.groupingRules) {
      const matchingItems = items.filter(item => rule.condition(item))

      if (matchingItems.length === 0) continue

      // Group by subcategory if extractor is provided
      if (rule.subcategoryExtractor) {
        const subcategoryGroups = this.groupBySubcategory(matchingItems, rule.subcategoryExtractor)

        const groups: ItemGroup[] = Object.entries(subcategoryGroups).map(([subcategory, subItems]) => ({
          id: `${rule.name}-${subcategory.toLowerCase().replace(/\s+/g, '-')}`,
          name: `${rule.displayName} - ${subcategory}`,
          items: this.sortItems(subItems),
          subcategory,
          metadata: {
            ruleType: rule.name,
            subcategory
          }
        }))

        sections.push({
          id: rule.name,
          name: rule.name,
          displayName: rule.displayName || rule.name,
          groups,
          icon: rule.icon,
          order: rule.order || 0,
          metadata: {
            ruleType: rule.name,
            hasSubcategories: true
          }
        })
      } else {
        // Single group for this section
        const group: ItemGroup = {
          id: rule.name,
          name: rule.displayName || rule.name,
          items: this.sortItems(matchingItems),
          metadata: {
            ruleType: rule.name
          }
        }

        sections.push({
          id: rule.name,
          name: rule.name,
          displayName: rule.displayName || rule.name,
          groups: [group],
          icon: rule.icon,
          order: rule.order || 0,
          metadata: {
            ruleType: rule.name,
            hasSubcategories: false
          }
        })
      }

      // Remove matched items from remaining items to process
      items = items.filter(item => !rule.condition(item))
    }

    // Sort sections by order
    return sections.sort((a, b) => (a.order || 0) - (b.order || 0))
  }

  /**
   * Group items by subcategory using the provided extractor function
   */
  private groupBySubcategory(
    items: BaseItem[],
    extractor: (item: BaseItem) => string
  ): Record<string, BaseItem[]> {
    const groups: Record<string, BaseItem[]> = {}

    items.forEach(item => {
      const subcategory = extractor(item)
      if (!groups[subcategory]) {
        groups[subcategory] = []
      }
      groups[subcategory].push(item)
    })

    return groups
  }

  /**
   * Sort items by name (default) - can be overridden
   */
  private sortItems(items: BaseItem[]): BaseItem[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name))
  }

  /**
   * Get items that belong to a specific category
   */
  getItemsByCategory(items: BaseItem[], categoryId: string): BaseItem[] {
    return items.filter(item =>
      item.metadata?.categoryIds?.includes(categoryId)
    )
  }

  /**
   * Get all unique categories used by items
   */
  getUsedCategories(items: BaseItem[], categories: Category[]): Category[] {
    const usedCategoryIds = new Set<string>()

    items.forEach(item => {
      const categoryIds = item.metadata?.categoryIds || []
      categoryIds.forEach((id: string) => usedCategoryIds.add(id))
    })

    return categories.filter(category => usedCategoryIds.has(category.id))
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: MenuConfig) {
    this.config = newConfig
  }

  /**
   * Add a custom grouping rule
   */
  addGroupingRule(rule: GroupingRule) {
    this.config.groupingRules.push(rule)
  }

  /**
   * Remove a grouping rule by name
   */
  removeGroupingRule(ruleName: string) {
    this.config.groupingRules = this.config.groupingRules.filter(
      rule => rule.name !== ruleName
    )
  }
}