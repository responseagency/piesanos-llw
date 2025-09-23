import type { DataAdapter, BaseItem, Category, MenuConfig } from '../core/types'
import { DataTransformer } from '../core/DataTransformer'

/**
 * Airtable-specific data adapter
 * Handles fetching and transforming Airtable data into the generic format
 */
export class AirtableAdapter implements DataAdapter {
  name = 'airtable'
  private baseUrl: string
  private apiKey: string
  private transformer: DataTransformer | null = null

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
  }

  /**
   * Fetch data from Airtable
   */
  async fetchData(): Promise<any[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.records || []
    } catch (error) {
      console.error('Error fetching Airtable data:', error)
      throw error
    }
  }

  /**
   * Transform Airtable records to BaseItems
   */
  transformToBaseItems(rawData: any[], config: MenuConfig): BaseItem[] {
    if (!this.transformer) {
      this.transformer = new DataTransformer(config)
    }
    return this.transformer.transformToBaseItems(rawData)
  }

  /**
   * Extract and map categories from Airtable data
   */
  mapCategories(rawData: any[], config: MenuConfig): Category[] {
    const items = this.transformToBaseItems(rawData, config)
    if (!this.transformer) {
      this.transformer = new DataTransformer(config)
    }
    return this.transformer.extractCategories(items)
  }

  /**
   * Create an Airtable adapter instance from environment variables
   */
  static fromEnvironment(): AirtableAdapter {
    const baseUrl = import.meta.env.VITE_AIRTABLE_BASE_URL
    const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY

    if (!baseUrl || !apiKey) {
      throw new Error('Airtable configuration missing. Please set VITE_AIRTABLE_BASE_URL and VITE_AIRTABLE_API_KEY')
    }

    return new AirtableAdapter(baseUrl, apiKey)
  }
}