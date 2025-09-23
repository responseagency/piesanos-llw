# Comprehensive Refactoring Guide for Vue.js Menu Application

This guide provides a step-by-step migration path to transform your beverage-specific menu application into a flexible, reusable menu system.

## 📋 Overview

The refactoring introduces:
- **Generic data abstraction layer** - Works with any data source
- **Configuration-driven architecture** - Customizable without code changes
- **Plugin system** - Specialized behavior for different menu types
- **TypeScript support** - Better type safety and developer experience
- **Theme system** - Configurable styling and layout
- **Modular composables** - Reusable business logic

## 🗂️ New File Structure

```
src/
├── core/                          # Core abstractions
│   ├── types.ts                   # TypeScript type definitions
│   ├── DataTransformer.ts         # Generic data transformation
│   └── MenuOrganizer.ts           # Menu organization logic
├── adapters/                      # Data source adapters
│   └── AirtableAdapter.ts         # Airtable-specific adapter
├── configs/                       # Menu configurations
│   ├── beverageConfig.ts          # Beverage menu config
│   └── foodConfig.ts              # Food menu config (example)
├── plugins/                       # Plugin system
│   ├── PluginManager.ts           # Plugin management
│   ├── BeveragePlugin.ts          # Beverage-specific plugin
│   ├── components/                # Plugin-specific components
│   │   ├── BeverageMenuItem.vue
│   │   └── BeverageSection.vue
│   └── composables/               # Plugin-specific composables
│       ├── useWineGrouping.ts
│       └── useBeverageStats.ts
├── themes/                        # Theme system
│   └── themeSystem.ts             # Theme definitions and manager
├── components/                    # Generic components
│   ├── GenericMenuSection.vue     # Generic section component
│   └── GenericMenuItem.vue        # Generic item component
├── composables/                   # Generic composables
│   ├── useGenericMenu.ts          # Main menu composable
│   ├── useCategoryMapping.ts      # Category mapping logic
│   └── useTheme.ts                # Theme management
└── App.refactored.vue             # Refactored main app component
```

## 🚀 Migration Strategy

### Phase 1: Setup and Foundation (Day 1-2)

1. **Install TypeScript support:**
```bash
npm install typescript @types/node
```

2. **Update package.json with TypeScript support:**
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  }
}
```

3. **Copy the new files** from the refactored structure:
   - Copy all files from `/core/`, `/adapters/`, `/configs/`, `/plugins/`, `/themes/`, and new `/composables/`
   - Add `tsconfig.json` and `tsconfig.node.json`
   - Update `vite.config.js` with TypeScript support

### Phase 2: Gradual Component Migration (Day 3-5)

#### Step 1: Test the new system alongside the old one

1. **Create a new route or page** that uses the refactored components:
```vue
<!-- TestRefactored.vue -->
<template>
  <div>
    <!-- Include App.refactored.vue content here -->
  </div>
</template>
```

2. **Configure environment variables** for the new system to use your existing Airtable setup.

#### Step 2: Verify data compatibility

1. **Test data transformation** by comparing outputs:
```typescript
// In a test component
import { AirtableAdapter } from '@/adapters/AirtableAdapter'
import { beverageMenuConfig } from '@/configs/beverageConfig'

const adapter = AirtableAdapter.fromEnvironment()
const rawData = await adapter.fetchData()
const transformedData = adapter.transformToBaseItems(rawData, beverageMenuConfig)

console.log('Original data:', rawData)
console.log('Transformed data:', transformedData)
```

#### Step 3: Component-by-component migration

1. **Start with BeverageSection.vue:**
   - Replace your current `BeverageSection.vue` with the plugin version
   - Update imports and props as needed

2. **Migrate WineItem.vue to BeverageMenuItem.vue:**
   - The new component handles both wine groupings and regular items
   - Update parent components to use the new component

3. **Test each component** individually before proceeding

### Phase 3: Full Migration (Day 6-7)

#### Step 1: Replace main App.vue

1. **Backup your current App.vue:**
```bash
cp src/App.vue src/App.vue.backup
```

2. **Replace with refactored version:**
```bash
cp src/App.refactored.vue src/App.vue
```

3. **Update imports and dependencies** as needed

#### Step 2: Clean up old files

1. **Remove old utilities** (after verifying everything works):
   - `src/utils/beverageOrganizer.js`
   - `src/composables/useDynamicCategoryMapping.js`
   - Old component files if fully replaced

2. **Update remaining imports** throughout the codebase

### Phase 4: Testing and Optimization (Day 8-10)

#### Step 1: Comprehensive testing

1. **Functional testing:**
   - Verify all menu sections display correctly
   - Test filtering and sorting functionality
   - Ensure wine grouping works as expected
   - Validate category mapping accuracy

2. **Performance testing:**
   - Compare load times with the original version
   - Test with large datasets
   - Monitor memory usage

#### Step 2: Configuration customization

1. **Customize the beverage config** for your specific needs:
```typescript
// In beverageConfig.ts
export const customBeverageConfig: MenuConfig = {
  ...beverageMenuConfig,
  displayOptions: {
    ...beverageMenuConfig.displayOptions,
    itemsPerRow: 4, // Customize layout
    theme: 'custom-theme' // Use custom theme
  }
}
```

2. **Create custom themes** if needed:
```typescript
// Custom theme example
const restaurantTheme = themeManager.createThemeVariant(
  'beverage',
  'restaurant-brand',
  {
    colors: {
      primary: '#YOUR_BRAND_COLOR',
      accent: '#YOUR_ACCENT_COLOR'
    }
  }
)
```

## 🔧 Configuration Examples

### Creating a Food Menu

```typescript
// foodMenuConfig.ts
export const pizzaMenuConfig: MenuConfig = {
  title: 'Pizza Menu',
  fieldMapping: {
    id: 'id',
    name: 'fields.Name',
    price: 'fields.Price',
    description: 'fields.Description'
  },
  groupingRules: [
    {
      name: 'pizza',
      condition: (item) => item.name.toLowerCase().includes('pizza'),
      subcategoryExtractor: (item) => {
        if (item.name.toLowerCase().includes('margherita')) return 'Classic'
        if (item.name.toLowerCase().includes('pepperoni')) return 'Meat'
        return 'Specialty'
      },
      displayName: 'Pizzas',
      icon: '🍕',
      order: 1
    }
  ],
  categoryRules: [],
  displayOptions: {
    showStats: true,
    showFilters: true,
    itemsPerRow: 2, // Fewer columns for food items with descriptions
    theme: 'food'
  }
}
```

### Adding a Custom Data Source

```typescript
// customAdapter.ts
export class JSONAdapter implements DataAdapter {
  name = 'json'

  constructor(private dataUrl: string) {}

  async fetchData(): Promise<any[]> {
    const response = await fetch(this.dataUrl)
    return response.json()
  }

  transformToBaseItems(rawData: any[], config: MenuConfig): BaseItem[] {
    // Transform your JSON data to BaseItem format
    return rawData.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      // ... other mappings
    }))
  }

  mapCategories(rawData: any[], config: MenuConfig): Category[] {
    // Extract categories from your data
    return []
  }
}
```

## 🎨 Theming Guide

### Using Built-in Themes

```vue
<script setup>
import { useTheme } from '@/composables/useTheme'

const { setTheme } = useTheme()

// Switch to food theme
setTheme('food')
</script>
```

### Creating Custom Themes

```typescript
import { themeManager } from '@/themes/themeSystem'

// Create a custom theme
const customTheme = {
  name: 'my-restaurant',
  colors: {
    primary: '#8B0000', // Dark red
    secondary: '#D4AF37', // Gold
    background: '#FFF8DC', // Cornsilk
    // ... other colors
  },
  // ... other theme properties
}

themeManager.registerTheme(customTheme)
```

## 🧪 Testing Strategy

### Unit Tests

1. **Test data transformation:**
```typescript
import { DataTransformer } from '@/core/DataTransformer'
import { beverageMenuConfig } from '@/configs/beverageConfig'

describe('DataTransformer', () => {
  it('should transform Airtable data correctly', () => {
    const transformer = new DataTransformer(beverageMenuConfig)
    const mockData = [/* mock Airtable record */]
    const result = transformer.transformToBaseItems(mockData)

    expect(result[0].name).toBe('Expected Name')
    expect(result[0].price).toBe(10.99)
  })
})
```

2. **Test menu organization:**
```typescript
import { MenuOrganizer } from '@/core/MenuOrganizer'

describe('MenuOrganizer', () => {
  it('should group items by configured rules', () => {
    const organizer = new MenuOrganizer(beverageMenuConfig)
    const mockItems = [/* mock BaseItem objects */]
    const sections = organizer.organizeIntoSections(mockItems, [])

    expect(sections).toHaveLength(expectedSectionCount)
    expect(sections[0].name).toBe('wine')
  })
})
```

### Integration Tests

1. **Test full data flow:**
```typescript
import { useGenericMenu } from '@/composables/useGenericMenu'
import { AirtableAdapter } from '@/adapters/AirtableAdapter'

describe('Generic Menu Integration', () => {
  it('should load and organize menu data', async () => {
    const adapter = new MockAirtableAdapter()
    const { fetchData, sections, items } = useGenericMenu(adapter, beverageMenuConfig)

    await fetchData()

    expect(items.value).toHaveLength(expectedItemCount)
    expect(sections.value).toHaveLength(expectedSectionCount)
  })
})
```

## 🚨 Common Migration Issues

### Issue 1: Field Mapping Mismatches

**Problem:** Data doesn't display correctly after migration.

**Solution:** Check your field mapping configuration:
```typescript
// Ensure field paths match your actual data structure
const fieldMapping = {
  id: 'id', // Should be the path to the record ID
  name: 'fields.Name', // Airtable nests data under 'fields'
  price: 'fields.Price' // Check exact field names in Airtable
}
```

### Issue 2: Component Props Changes

**Problem:** Components fail to render due to prop mismatches.

**Solution:** Update component usage:
```vue
<!-- Old way -->
<WineItem :wine-group="wineGroup" />

<!-- New way -->
<BeverageMenuItem
  :item="item"
  :config="config"
  :wine-servings="wineGroup.servings"
  :wine-base-name="wineGroup.baseName"
/>
```

### Issue 3: Category Mapping Not Working

**Problem:** Categories show as "Category ABC123" instead of readable names.

**Solution:** Check your category rules configuration:
```typescript
// Ensure patterns match your actual data
const categoryRules = [
  {
    field: 'name', // Check this matches how you want to extract categories
    patterns: [
      { pattern: /\bchardonnay\b/i, categoryName: 'Chardonnay' }
    ]
  }
]
```

## 📈 Performance Considerations

### Optimizations

1. **Lazy loading of plugins:**
```typescript
// Load plugins only when needed
const loadBeveragePlugin = () => import('@/plugins/BeveragePlugin')
```

2. **Memoization of expensive computations:**
```typescript
import { computed, ref } from 'vue'

const memoizedStats = computed(() => {
  // Expensive computation
  return calculateComplexStats(items.value)
})
```

3. **Virtual scrolling for large lists:**
```vue
<!-- For menus with hundreds of items -->
<virtual-list
  :data-key="'id'"
  :data-sources="items"
  :data-component="MenuItem"
  :estimate-size="120"
/>
```

## 🚀 Future Enhancements

### Planned Features

1. **Real-time updates** with WebSocket support
2. **Offline caching** with Service Workers
3. **Multi-language support** with i18n
4. **Advanced search** with fuzzy matching
5. **Menu analytics** and insights
6. **Drag-and-drop** menu builder interface

### Extensibility Examples

1. **Adding new menu types:**
```typescript
// retailConfig.ts - for retail product catalogs
export const retailConfig: MenuConfig = {
  title: 'Product Catalog',
  groupingRules: [
    {
      name: 'electronics',
      condition: (item) => item.metadata?.category === 'electronics',
      displayName: 'Electronics',
      icon: '📱'
    }
  ]
  // ... other config
}
```

2. **Custom data transformations:**
```typescript
// Add custom transformers for different data formats
class CSVAdapter implements DataAdapter {
  async fetchData() {
    // Parse CSV data
  }

  transformToBaseItems(rawData: any[], config: MenuConfig) {
    // Transform CSV to BaseItem format
  }
}
```

This refactoring maintains all your current functionality while making the system infinitely more flexible and maintainable. The migration can be done incrementally, allowing you to test each phase before proceeding to the next.