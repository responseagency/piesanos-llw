import type { BaseItem, Category, MenuConfig, FieldMapping } from './types'

/**
 * Generic data transformer that converts raw data source records
 * into standardized BaseItem and Category objects
 */
export class DataTransformer {
  private config: MenuConfig
  private fieldMapping: FieldMapping

  constructor(config: MenuConfig) {
    this.config = config
    this.fieldMapping = config.fieldMapping
  }

  /**
   * Transform raw records into BaseItem objects
   */
  transformToBaseItems(rawRecords: any[]): BaseItem[] {
    return rawRecords.map(record => this.transformSingleItem(record))
  }

  /**
   * Transform a single record into a BaseItem
   */
  private transformSingleItem(record: any): BaseItem {
    // Handle nested field access (e.g., "fields.Name" for Airtable)
    const getValue = (path: string) => {
      return path.split('.').reduce((obj, key) => obj?.[key], record)
    }

    const item: BaseItem = {
      id: getValue(this.fieldMapping.id),
      name: getValue(this.fieldMapping.name) || 'Unnamed Item',
      metadata: {
        originalRecord: record,
        source: 'transformed'
      }
    }

    // Optional fields
    if (this.fieldMapping.price) {
      const price = getValue(this.fieldMapping.price)
      item.price = typeof price === 'number' ? price : parseFloat(price) || 0
    }

    if (this.fieldMapping.isAvailable) {
      const availability = getValue(this.fieldMapping.isAvailable)
      item.isAvailable = this.parseAvailability(availability)
    }

    if (this.fieldMapping.description) {
      item.description = getValue(this.fieldMapping.description)
    }

    if (this.fieldMapping.imageUrl) {
      item.imageUrl = getValue(this.fieldMapping.imageUrl)
    }

    // Add categories if mapping exists
    if (this.fieldMapping.categories) {
      const categories = getValue(this.fieldMapping.categories)
      item.metadata.categoryIds = Array.isArray(categories) ? categories : [categories].filter(Boolean)
    }

    // Add type if mapping exists
    if (this.fieldMapping.type) {
      const type = getValue(this.fieldMapping.type)
      item.metadata.type = Array.isArray(type) ? type[0] : type
    }

    return item
  }

  /**
   * Parse availability from various formats
   */
  private parseAvailability(value: any): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      return value.toLowerCase().includes('valid') ||
             value.toLowerCase().includes('available') ||
             value.toLowerCase().includes('✅')
    }
    return true // Default to available
  }

  /**
   * Extract categories from transformed items
   */
  extractCategories(items: BaseItem[]): Category[] {
    const categoryMap = new Map<string, Category>()

    items.forEach(item => {
      const categoryIds = item.metadata?.categoryIds || []
      categoryIds.forEach((id: string) => {
        if (!categoryMap.has(id)) {
          categoryMap.set(id, {
            id,
            name: this.generateCategoryName(id, item),
            metadata: {}
          })
        }
      })
    })

    return Array.from(categoryMap.values())
  }

  /**
   * Generate category name using configured rules
   */
  private generateCategoryName(categoryId: string, item: BaseItem): string {
    // Try to extract from item name using category rules
    for (const rule of this.config.categoryRules) {
      const fieldValue = this.getFieldValueFromItem(item, rule.field)
      if (fieldValue) {
        for (const { pattern, categoryName } of rule.patterns) {
          if (pattern.test(fieldValue)) {
            return categoryName
          }
        }
      }
    }

    // Fallback to short ID
    return `Category ${categoryId.slice(-6)}`
  }

  /**
   * Get field value from item for category extraction
   */
  private getFieldValueFromItem(item: BaseItem, field: string): string {
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
   * Update field mapping (useful for runtime configuration changes)
   */
  updateFieldMapping(newMapping: Partial<FieldMapping>) {
    this.fieldMapping = { ...this.fieldMapping, ...newMapping }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: MenuConfig) {
    this.config = newConfig
    this.fieldMapping = newConfig.fieldMapping
  }
}