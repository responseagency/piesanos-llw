/**
 * @fileoverview Menu categorization engine
 * Handles intelligent categorization of menu items based on configuration
 */

import { beverageMenuConfig } from '../config/menuConfig.js'

/**
 * @typedef {Object} CategorizationResult
 * @property {string} menuType - The determined menu type (wine, beer, etc.)
 * @property {string} category - The determined category within the type
 * @property {number} confidence - Confidence score (0-1) of the categorization
 * @property {string} method - Method used for categorization ('keyword', 'legacy', 'inference')
 * @property {Object} metadata - Additional categorization metadata
 */

/**
 * @typedef {Object} CategorizationStats
 * @property {number} total - Total items categorized
 * @property {number} byKeyword - Items categorized by keyword matching
 * @property {number} byLegacy - Items categorized by legacy type mapping
 * @property {number} byInference - Items categorized by name inference
 * @property {number} fallback - Items that fell back to default categories
 * @property {Object} typeDistribution - Distribution of items by menu type
 */

/**
 * Menu categorization engine that uses configuration to intelligently
 * categorize menu items into types and categories
 */
export class MenuCategorizationEngine {
  /**
   * @param {Object} [config] - Configuration object (defaults to beverageMenuConfig)
   */
  constructor(config = beverageMenuConfig) {
    this.config = config
    this.stats = this.initializeStats()
  }

  /**
   * Initialize categorization statistics
   * @returns {CategorizationStats} Empty stats object
   * @private
   */
  initializeStats() {
    return {
      total: 0,
      byKeyword: 0,
      byLegacy: 0,
      byInference: 0,
      fallback: 0,
      typeDistribution: {}
    }
  }

  /**
   * Categorize a menu item into type and category
   * @param {Object} item - Menu item to categorize
   * @returns {CategorizationResult} Categorization result
   */
  categorizeItem(item) {
    this.stats.total++

    // Try legacy type mapping first (for backward compatibility)
    const legacyResult = this.tryLegacyMapping(item)
    if (legacyResult) {
      this.stats.byLegacy++
      return legacyResult
    }

    // Try keyword-based categorization
    const keywordResult = this.tryKeywordCategorization(item)
    if (keywordResult) {
      this.stats.byKeyword++
      return keywordResult
    }

    // Try name inference as fallback
    const inferenceResult = this.tryNameInference(item)
    if (inferenceResult) {
      this.stats.byInference++
      return inferenceResult
    }

    // Fallback to 'other' category
    this.stats.fallback++
    return this.createFallbackResult(item)
  }

  /**
   * Try legacy type ID mapping
   * @param {Object} item - Menu item
   * @returns {CategorizationResult|null} Result or null if no legacy mapping
   * @private
   */
  tryLegacyMapping(item) {
    const typeId = item.type
    const menuType = this.config.legacyTypeMappings[typeId]

    if (!menuType) return null

    const category = this.determineCategoryForType(item, menuType)

    return {
      menuType,
      category,
      confidence: 0.9, // High confidence for legacy mappings
      method: 'legacy',
      metadata: { legacyTypeId: typeId }
    }
  }

  /**
   * Try keyword-based categorization
   * @param {Object} item - Menu item
   * @returns {CategorizationResult|null} Result or null if no keyword match
   * @private
   */
  tryKeywordCategorization(item) {
    const itemName = (item.name || '').toLowerCase()

    // Check each menu type for keyword matches
    for (const [menuTypeKey, menuTypeConfig] of Object.entries(this.config.menuTypes)) {
      for (const [categoryKey, categoryConfig] of Object.entries(menuTypeConfig.categories)) {
        const matchingKeywords = categoryConfig.keywords.filter(keyword =>
          itemName.includes(keyword.toLowerCase())
        )

        if (matchingKeywords.length > 0) {
          // Calculate confidence based on keyword matches
          const confidence = Math.min(0.8 + (matchingKeywords.length * 0.1), 1.0)

          return {
            menuType: menuTypeKey,
            category: categoryKey,
            confidence,
            method: 'keyword',
            metadata: {
              matchedKeywords: matchingKeywords,
              totalKeywords: categoryConfig.keywords.length
            }
          }
        }
      }
    }

    return null
  }

  /**
   * Try name inference for common patterns
   * @param {Object} item - Menu item
   * @returns {CategorizationResult|null} Result or null if no inference possible
   * @private
   */
  tryNameInference(item) {
    const itemName = (item.name || '').toLowerCase()

    // General beverage type inference
    const typeInferences = [
      { pattern: /wine|cabernet|merlot|chardonnay|pinot|shiraz|riesling/i, type: 'wine' },
      { pattern: /beer|ale|lager|stout|ipa|pilsner|porter/i, type: 'beer' },
      { pattern: /cocktail|martini|margarita|mojito|cosmopolitan/i, type: 'cocktails' },
      { pattern: /seltzer|cider|hard/i, type: 'other' }
    ]

    for (const inference of typeInferences) {
      if (inference.pattern.test(item.name)) {
        const category = this.determineCategoryForType(item, inference.type)

        return {
          menuType: inference.type,
          category,
          confidence: 0.6, // Lower confidence for inference
          method: 'inference',
          metadata: { pattern: inference.pattern.toString() }
        }
      }
    }

    return null
  }

  /**
   * Determine category within a menu type
   * @param {Object} item - Menu item
   * @param {string} menuType - Menu type key
   * @returns {string} Category key
   * @private
   */
  determineCategoryForType(item, menuType) {
    const menuTypeConfig = this.config.menuTypes[menuType]
    if (!menuTypeConfig) return 'other'

    const itemName = (item.name || '').toLowerCase()

    // Check categories within the type for keyword matches
    for (const [categoryKey, categoryConfig] of Object.entries(menuTypeConfig.categories)) {
      if (categoryConfig.keywords.some(keyword => itemName.includes(keyword.toLowerCase()))) {
        return categoryKey
      }
    }

    // For wine, try specific categorization logic
    if (menuType === 'wine') {
      return this.categorizeWineSpecific(item)
    }

    // For beer, try specific categorization logic
    if (menuType === 'beer') {
      return this.categorizeBeerSpecific(item)
    }

    // Default to first category or 'other'
    const categories = Object.keys(menuTypeConfig.categories)
    return categories.includes('other') ? 'other' : categories[0] || 'other'
  }

  /**
   * Wine-specific categorization logic
   * @param {Object} item - Menu item
   * @returns {string} Wine category
   * @private
   */
  categorizeWineSpecific(item) {
    const name = (item.name || '').toLowerCase()

    // Red wine patterns
    const redKeywords = this.config.menuTypes.wine.categories.red.keywords
    if (redKeywords.some(keyword => name.includes(keyword))) return 'red'

    // White wine patterns
    const whiteKeywords = this.config.menuTypes.wine.categories.white.keywords
    if (whiteKeywords.some(keyword => name.includes(keyword))) return 'white'

    // Blush/rosé patterns
    const blushKeywords = this.config.menuTypes.wine.categories.blush.keywords
    if (blushKeywords.some(keyword => name.includes(keyword))) return 'blush'

    return 'other'
  }

  /**
   * Beer-specific categorization logic
   * @param {Object} item - Menu item
   * @returns {string} Beer category
   * @private
   */
  categorizeBeerSpecific(item) {
    const name = (item.name || '').toLowerCase()

    // Draught indicators
    if (name.includes('glass') || name.includes('pint') || name.includes('oz') ||
        name.includes('draught') || name.includes('tap')) {
      return 'draught'
    }

    // Bottle indicators
    if (name.includes('bottle') || name.includes('can')) {
      return 'bottles'
    }

    // Default to draught for beer if unclear
    return 'draught'
  }

  /**
   * Create fallback categorization result
   * @param {Object} item - Menu item
   * @returns {CategorizationResult} Fallback result
   * @private
   */
  createFallbackResult(item) {
    return {
      menuType: 'other',
      category: 'misc',
      confidence: 0.1,
      method: 'fallback',
      metadata: { reason: 'no_pattern_match' }
    }
  }

  /**
   * Batch categorize multiple items
   * @param {Object[]} items - Array of menu items
   * @returns {Object} Categorization results grouped by type and category
   */
  categorizeItems(items) {
    this.stats = this.initializeStats()
    const results = {}

    items.forEach(item => {
      const categorization = this.categorizeItem(item)
      const { menuType, category } = categorization

      // Initialize structure if needed
      if (!results[menuType]) {
        results[menuType] = {}
      }
      if (!results[menuType][category]) {
        results[menuType][category] = []
      }

      // Add item with categorization metadata
      results[menuType][category].push({
        ...item,
        _categorization: categorization
      })

      // Update stats
      if (!this.stats.typeDistribution[menuType]) {
        this.stats.typeDistribution[menuType] = 0
      }
      this.stats.typeDistribution[menuType]++
    })

    // Sort items within each category
    this.sortCategorizedItems(results)

    return results
  }

  /**
   * Sort items within categories based on configuration
   * @param {Object} categorizedItems - Categorized items object
   * @private
   */
  sortCategorizedItems(categorizedItems) {
    Object.keys(categorizedItems).forEach(menuType => {
      const menuTypeConfig = this.config.menuTypes[menuType]
      const sortBy = menuTypeConfig?.display?.sortBy || 'name'

      Object.keys(categorizedItems[menuType]).forEach(category => {
        const items = categorizedItems[menuType][category]

        items.sort((a, b) => {
          switch (sortBy) {
            case 'price':
              return (a.price || 0) - (b.price || 0)
            case 'name':
            default:
              return (a.name || '').localeCompare(b.name || '')
          }
        })
      })
    })
  }

  /**
   * Get categorization statistics
   * @returns {CategorizationStats} Current statistics
   */
  getStats() {
    return { ...this.stats }
  }

  /**
   * Reset categorization statistics
   */
  resetStats() {
    this.stats = this.initializeStats()
  }

  /**
   * Get human-readable category label
   * @param {string} menuType - Menu type key
   * @param {string} category - Category key
   * @returns {string} Human-readable label
   */
  getCategoryLabel(menuType, category) {
    const menuTypeConfig = this.config.menuTypes[menuType]
    const categoryConfig = menuTypeConfig?.categories[category]

    if (categoryConfig) {
      const typeLabel = menuTypeConfig.label
      const categoryLabel = categoryConfig.label
      return `${typeLabel} - ${categoryLabel}`
    }

    return `${menuType} - ${category}`
  }

  /**
   * Get category styling configuration
   * @param {string} menuType - Menu type key
   * @param {string} category - Category key
   * @returns {Object|null} Styling configuration
   */
  getCategoryStyling(menuType, category) {
    const categoryConfig = this.config.menuTypes[menuType]?.categories[category]
    return categoryConfig?.styling || null
  }
}