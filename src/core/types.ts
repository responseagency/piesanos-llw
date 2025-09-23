// Core type definitions for the generic menu system

export interface BaseItem {
  id: string
  name: string
  price?: number
  isAvailable?: boolean
  description?: string
  imageUrl?: string
  metadata?: Record<string, any>
}

export interface Category {
  id: string
  name: string
  displayName?: string
  parentCategoryId?: string
  metadata?: Record<string, any>
}

export interface ItemGroup {
  id: string
  name: string
  items: BaseItem[]
  category?: Category
  subcategory?: string
  metadata?: Record<string, any>
}

export interface MenuSection {
  id: string
  name: string
  displayName: string
  groups: ItemGroup[]
  icon?: string
  order?: number
  metadata?: Record<string, any>
}

export interface MenuData {
  sections: MenuSection[]
  categories: Category[]
  items: BaseItem[]
  metadata?: Record<string, any>
}

// Configuration types
export interface FieldMapping {
  id: string
  name: string
  price?: string
  isAvailable?: string
  description?: string
  imageUrl?: string
  categories?: string
  type?: string
  [key: string]: string | undefined
}

export interface CategoryMappingRule {
  field: string
  patterns: Array<{
    pattern: RegExp
    categoryName: string
    subcategory?: string
  }>
}

export interface GroupingRule {
  name: string
  condition: (item: BaseItem) => boolean
  subcategoryExtractor?: (item: BaseItem) => string
  displayName?: string
  icon?: string
  order?: number
}

export interface MenuConfig {
  title: string
  fieldMapping: FieldMapping
  categoryRules: CategoryMappingRule[]
  groupingRules: GroupingRule[]
  displayOptions: {
    showStats?: boolean
    showFilters?: boolean
    allowSorting?: boolean
    itemsPerRow?: number
    theme?: string
  }
  metadata?: Record<string, any>
}

// Data adapter interface
export interface DataAdapter {
  name: string
  fetchData(): Promise<any[]>
  transformToBaseItems(rawData: any[], config: MenuConfig): BaseItem[]
  mapCategories(rawData: any[], config: MenuConfig): Category[]
}

// Plugin interface for different menu types
export interface MenuPlugin {
  name: string
  type: string // 'beverage', 'food', 'retail', etc.
  defaultConfig: Partial<MenuConfig>
  customComponents?: Record<string, any>
  customComposables?: Record<string, any>
}