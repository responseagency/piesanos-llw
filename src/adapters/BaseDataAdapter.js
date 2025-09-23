/**
 * @fileoverview Base data adapter interface
 * Defines the contract for all data adapters in the menu system
 */

/**
 * @typedef {Object} AdapterConfig
 * @property {string} type - Adapter type identifier
 * @property {string} endpoint - Data source endpoint
 * @property {Object} fieldMappings - Field mapping configuration
 * @property {string} availabilityValue - Value that indicates item availability
 * @property {Object} [auth] - Authentication configuration
 * @property {Object} [cache] - Cache configuration
 */

/**
 * @typedef {Object} MenuItem
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {number} price - Item price
 * @property {boolean} available - Availability status
 * @property {string} type - Menu item type
 * @property {string[]} categories - Item categories
 * @property {Object} metadata - Additional item data
 * @property {Object} rawData - Original data from source
 */

/**
 * Base data adapter class that all specific adapters should extend
 * Provides a common interface for data operations across different sources
 */
export class BaseDataAdapter {
  /**
   * @param {AdapterConfig} config - Adapter configuration
   */
  constructor(config) {
    this.config = config
    this.cache = new Map()
    this.lastFetch = null
    this.cacheTimeout = config.cache?.timeout || 300000 // 5 minutes default
  }

  /**
   * Fetch raw data from the source
   * Must be implemented by concrete adapters
   * @returns {Promise<Array>} Raw data from source
   * @abstract
   */
  async fetchRawData() {
    throw new Error('fetchRawData must be implemented by concrete adapter')
  }

  /**
   * Transform raw data item to standardized menu item format
   * Must be implemented by concrete adapters
   * @param {Object} rawItem - Raw data item from source
   * @returns {MenuItem} Standardized menu item
   * @abstract
   */
  transformItem(rawItem) {
    throw new Error('transformItem must be implemented by concrete adapter')
  }

  /**
   * Get data with caching support
   * @param {boolean} [forceRefresh=false] - Force refresh cache
   * @returns {Promise<MenuItem[]>} Array of standardized menu items
   */
  async getData(forceRefresh = false) {
    const cacheKey = 'menu_data'
    const now = Date.now()

    // Check cache if not forcing refresh
    if (!forceRefresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (now - cached.timestamp < this.cacheTimeout) {
        return cached.data
      }
    }

    try {
      // Fetch fresh data
      const rawData = await this.fetchRawData()
      const transformedData = rawData.map(item => this.transformItem(item))

      // Cache the result
      this.cache.set(cacheKey, {
        data: transformedData,
        timestamp: now
      })

      this.lastFetch = now
      return transformedData
    } catch (error) {
      console.error('Error fetching data:', error)

      // Return cached data if available and fetch fails
      if (this.cache.has(cacheKey)) {
        console.warn('Using cached data due to fetch error')
        return this.cache.get(cacheKey).data
      }

      throw error
    }
  }

  /**
   * Clear the adapter cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      lastFetch: this.lastFetch,
      hasData: this.cache.has('menu_data')
    }
  }

  /**
   * Validate adapter configuration
   * @returns {boolean} True if configuration is valid
   */
  validateConfig() {
    if (!this.config.type) {
      throw new Error('Adapter type is required')
    }
    if (!this.config.fieldMappings) {
      throw new Error('Field mappings are required')
    }
    return true
  }

  /**
   * Get field value using field mapping
   * @param {Object} rawItem - Raw data item
   * @param {string} fieldKey - Field key from mapping
   * @returns {*} Field value
   * @protected
   */
  getFieldValue(rawItem, fieldKey) {
    const mapping = this.config.fieldMappings[fieldKey]
    if (!mapping) return null

    // Support nested field access with dot notation
    if (mapping.includes('.')) {
      return mapping.split('.').reduce((obj, key) => obj?.[key], rawItem)
    }

    return rawItem[mapping]
  }

  /**
   * Check if item is available based on configuration
   * @param {Object} rawItem - Raw data item
   * @returns {boolean} True if item is available
   * @protected
   */
  isItemAvailable(rawItem) {
    const availabilityField = this.getFieldValue(rawItem, 'availability')
    return availabilityField === this.config.availabilityValue
  }

  /**
   * Generate unique ID for item
   * @param {Object} rawItem - Raw data item
   * @returns {string} Unique identifier
   * @protected
   */
  generateItemId(rawItem) {
    // Try to use existing ID field, otherwise generate one
    const existingId = rawItem.id || rawItem._id || rawItem.recordId
    if (existingId) return existingId

    // Generate ID from name and price if available
    const name = this.getFieldValue(rawItem, 'name') || 'unknown'
    const price = this.getFieldValue(rawItem, 'price') || 0
    return `${name.toLowerCase().replace(/\s+/g, '-')}-${price}`
  }
}