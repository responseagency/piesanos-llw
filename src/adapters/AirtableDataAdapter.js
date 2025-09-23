/**
 * @fileoverview Airtable-specific data adapter
 * Implements the BaseDataAdapter for Airtable data sources
 */

import { BaseDataAdapter } from './BaseDataAdapter.js'

/**
 * Airtable data adapter implementation
 * Handles fetching and transforming data from Airtable via the existing API
 */
export class AirtableDataAdapter extends BaseDataAdapter {
  /**
   * @param {AdapterConfig} config - Airtable adapter configuration
   */
  constructor(config) {
    super(config)
    this.validateConfig()
  }

  /**
   * Fetch raw data from Airtable API
   * @returns {Promise<Array>} Raw Airtable records
   * @override
   */
  async fetchRawData() {
    try {
      const response = await fetch(this.config.endpoint)

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown API error')
      }

      return result.data || []
    } catch (error) {
      console.error('Error fetching Airtable data:', error)
      throw error
    }
  }

  /**
   * Transform Airtable record to standardized menu item format
   * @param {Object} rawItem - Raw Airtable record
   * @returns {MenuItem} Standardized menu item
   * @override
   */
  transformItem(rawItem) {
    const fields = rawItem.fields || {}

    return {
      id: this.generateItemId(rawItem),
      name: fields[this.config.fieldMappings.name] || 'Unnamed Item',
      price: parseFloat(fields[this.config.fieldMappings.price]) || 0,
      available: this.isItemAvailable(rawItem),
      type: this.extractType(rawItem),
      categories: this.extractCategories(rawItem),
      format: fields[this.config.fieldMappings.format] || null,
      metadata: this.extractMetadata(rawItem),
      rawData: rawItem // Keep original data for backward compatibility
    }
  }

  /**
   * Extract item type from Airtable record
   * @param {Object} rawItem - Raw Airtable record
   * @returns {string} Item type
   * @private
   */
  extractType(rawItem) {
    const fields = rawItem.fields || {}
    const typeField = fields[this.config.fieldMappings.type]

    // Handle array of type IDs (Airtable linked records)
    if (Array.isArray(typeField) && typeField.length > 0) {
      return typeField[0] // Use first type ID
    }

    // Handle single type ID
    if (typeof typeField === 'string') {
      return typeField
    }

    return 'unknown'
  }

  /**
   * Extract categories from Airtable record
   * @param {Object} rawItem - Raw Airtable record
   * @returns {string[]} Array of category identifiers
   * @private
   */
  extractCategories(rawItem) {
    const fields = rawItem.fields || {}
    const categoriesField = fields[this.config.fieldMappings.categories]

    if (Array.isArray(categoriesField)) {
      return categoriesField
    }

    if (typeof categoriesField === 'string') {
      return [categoriesField]
    }

    return []
  }

  /**
   * Extract additional metadata from Airtable record
   * @param {Object} rawItem - Raw Airtable record
   * @returns {Object} Metadata object
   * @private
   */
  extractMetadata(rawItem) {
    const fields = rawItem.fields || {}
    const metadata = {}

    // Extract non-standard fields as metadata
    const standardFields = new Set([
      this.config.fieldMappings.name,
      this.config.fieldMappings.price,
      this.config.fieldMappings.availability,
      this.config.fieldMappings.type,
      this.config.fieldMappings.categories,
      this.config.fieldMappings.format
    ])

    Object.keys(fields).forEach(fieldKey => {
      if (!standardFields.has(fieldKey)) {
        metadata[fieldKey] = fields[fieldKey]
      }
    })

    // Add record-level metadata
    metadata.recordId = rawItem.id
    metadata.createdTime = rawItem.createdTime

    return metadata
  }

  /**
   * Validate Airtable-specific configuration
   * @returns {boolean} True if configuration is valid
   * @override
   */
  validateConfig() {
    super.validateConfig()

    if (!this.config.endpoint) {
      throw new Error('Airtable endpoint is required')
    }

    const requiredMappings = ['name', 'price', 'availability', 'type']
    requiredMappings.forEach(mapping => {
      if (!this.config.fieldMappings[mapping]) {
        throw new Error(`Field mapping for '${mapping}' is required`)
      }
    })

    return true
  }

  /**
   * Get Airtable-specific statistics
   * @returns {Object} Airtable statistics
   */
  async getAirtableStats() {
    try {
      const data = await this.getData()
      return {
        totalRecords: data.length,
        availableRecords: data.filter(item => item.available).length,
        uniqueTypes: new Set(data.map(item => item.type)).size,
        uniqueCategories: new Set(data.flatMap(item => item.categories)).size,
        priceRange: this.calculatePriceRange(data)
      }
    } catch (error) {
      console.error('Error calculating Airtable stats:', error)
      return null
    }
  }

  /**
   * Calculate price range from data
   * @param {MenuItem[]} data - Menu items
   * @returns {Object} Price range information
   * @private
   */
  calculatePriceRange(data) {
    const prices = data.map(item => item.price).filter(price => price > 0)

    if (prices.length === 0) {
      return { min: 0, max: 0, avg: 0 }
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
    }
  }
}