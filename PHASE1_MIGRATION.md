# Phase 1: Configuration-Driven Menu System Migration

This guide shows how to integrate the new configuration-driven menu system while maintaining backward compatibility.

## What We've Built

### 1. Core Configuration System (`/src/config/menuConfig.js`)
- **Centralized configuration** for all menu behavior
- **Flexible categorization rules** with keyword matching
- **Theme and styling configuration**
- **Feature flags** for enabling/disabling functionality
- **Legacy mapping support** for backward compatibility

### 2. Generic Data Adapter Pattern (`/src/adapters/`)
- **BaseDataAdapter**: Abstract interface for any data source
- **AirtableDataAdapter**: Concrete implementation for your current Airtable setup
- **Built-in caching** and error handling
- **Standardized data transformation**

### 3. Intelligent Categorization Engine (`/src/engines/MenuCategorizationEngine.js`)
- **Configuration-driven categorization** (no more hardcoded logic!)
- **Multiple categorization strategies**: keyword matching, legacy mapping, name inference
- **Confidence scoring** and method tracking
- **Detailed statistics** and analytics

### 4. Unified Composable (`/src/composables/useConfigurableMenu.js`)
- **Drop-in replacement** for your current composables
- **Reactive categorization** and filtering
- **Built-in statistics** and performance tracking
- **Theme and styling integration**

## Migration Steps

### Step 1: Test the New System (Optional Integration)

Create a test version of your App.vue to verify everything works:

```vue
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Your existing template structure -->
    <!-- Just replace the script section initially -->
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useConfigurableMenu } from './composables/useConfigurableMenu'
// Keep your existing components for now
import BeverageSection from './components/BeverageSection.vue'
import WineSection from './components/WineSection.vue'
import BeerSection from './components/BeerSection.vue'

export default {
  name: 'App',
  components: {
    BeverageSection,
    WineSection,
    BeerSection
  },
  setup() {
    // Replace your existing composables with this single line!
    const menu = useConfigurableMenu()

    // Your existing reactive properties now come from the menu object
    const {
      data,
      loading,
      error,
      displayData,
      menuStats,
      categorizationStats,
      showOnlyAvailable,
      sortBy,
      fetchData,
      getCategoryLabel,
      getCategoryStyling
    } = menu

    const lastUpdated = ref(null)

    // Computed properties for backward compatibility with existing components
    const organizedBeverages = computed(() => {
      const organized = {}
      Object.keys(displayData.value).forEach(menuType => {
        Object.keys(displayData.value[menuType]).forEach(category => {
          const key = getCategoryLabel(menuType, category)
          organized[key] = displayData.value[menuType][category].map(item => item.rawData)
        })
      })
      return organized
    })

    const beverageStats = computed(() => {
      const stats = {}
      Object.keys(menuStats.value).forEach(key => {
        const [menuType, category] = key.split('-')
        const label = getCategoryLabel(menuType, category)
        stats[label] = menuStats.value[key]
      })
      return stats
    })

    // Wine and Beer subcategories for backward compatibility
    const wineSubcategories = computed(() => {
      const wine = displayData.value.wine || {}
      const result = {}
      Object.keys(wine).forEach(category => {
        const key = `Wine - ${wine[category][0]?._categorization?.category || category}`
        result[key] = wine[category].map(item => item.rawData)
      })
      return result
    })

    const beerSubcategories = computed(() => {
      const beer = displayData.value.beer || {}
      const result = {}
      Object.keys(beer).forEach(category => {
        const key = `Beer - ${beer[category][0]?._categorization?.category || category}`
        result[key] = beer[category].map(item => item.rawData)
      })
      return result
    })

    const otherBeverages = computed(() => {
      const result = {}
      ['cocktails', 'other'].forEach(menuType => {
        if (displayData.value[menuType]) {
          Object.keys(displayData.value[menuType]).forEach(category => {
            const key = getCategoryLabel(menuType, category)
            result[key] = displayData.value[menuType][category].map(item => item.rawData)
          })
        }
      })
      return result
    })

    const loadData = async () => {
      await fetchData()
      if (!error.value) {
        lastUpdated.value = new Date().toLocaleString()
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      // Backward compatible data
      data,
      loading,
      error,
      lastUpdated,
      organizedBeverages,
      beverageStats,
      wineSubcategories,
      beerSubcategories,
      otherBeverages,
      showOnlyAvailable,
      sortBy,

      // New features available
      displayData,
      menuStats,
      categorizationStats,
      getCategoryLabel,
      getCategoryStyling
    }
  }
}
</script>
```

### Step 2: Gradual Component Migration

Your existing components will work unchanged! But you can gradually enhance them:

#### Enhanced BeverageSection.vue Example:
```vue
<template>
  <div :class="[sectionStyling?.headerColor || 'bg-white', 'rounded-lg shadow-sm border p-6']">
    <h2 :class="[sectionStyling?.textColor || 'text-gray-900', 'text-2xl font-bold mb-4']">
      {{ displayTitle }}
    </h2>
    <!-- Rest of your existing template -->
  </div>
</template>

<script>
import { inject, computed } from 'vue'

export default {
  props: {
    type: String,
    beverages: Array,
    stats: Object
  },
  setup(props) {
    const menu = inject('configurableMenu', {})

    // Get styling from configuration
    const sectionStyling = computed(() => {
      if (!menu.getCategoryStyling) return null

      // Try to parse the type to get menu type and category
      const parts = props.type.split(' - ')
      const menuType = parts[0]?.toLowerCase()
      const category = parts[1]?.toLowerCase()

      return menu.getCategoryStyling(menuType, category)
    })

    const displayTitle = computed(() => {
      return props.type || 'Beverages'
    })

    return {
      sectionStyling,
      displayTitle
    }
  }
}
</script>
```

### Step 3: Configuration Customization

#### Easy Customization Examples:

**Add a new beverage category:**
```javascript
// In menuConfig.js, add to menuTypes.other.categories:
sake: {
  key: 'sake',
  label: 'Sake',
  keywords: ['sake', 'junmai', 'ginjo', 'daiginjo'],
  order: 4,
  styling: {
    headerColor: 'bg-indigo-50 border-indigo-200',
    textColor: 'text-indigo-800',
    accent: 'text-indigo-600'
  }
}
```

**Change sorting behavior:**
```javascript
// In menuConfig.js, modify display.sortBy for any menu type:
wine: {
  // ... existing config
  display: {
    sortBy: 'price-asc' // Sort by price instead of name
  }
}
```

**Disable features:**
```javascript
// In menuConfig.js, modify features:
features: {
  enableStats: false,        // Hide statistics
  enableFiltering: false,    // Hide filters
  showLastUpdated: false     // Hide last updated
}
```

## Benefits Achieved

### ✅ **Configuration-Driven**
- No more hardcoded categorization logic
- Easy to add new beverage types and categories
- Centralized styling and behavior control

### ✅ **Data Source Flexibility**
- Clean adapter pattern for switching data sources
- Built-in caching and error handling
- Standardized data transformation

### ✅ **Intelligent Categorization**
- Multiple categorization strategies
- Confidence scoring and analytics
- Backward compatible with your existing Airtable IDs

### ✅ **Maintainable Architecture**
- Single responsibility principle
- Dependency injection pattern
- Comprehensive error handling

### ✅ **Performance Optimized**
- Built-in caching
- Reactive updates only when needed
- Efficient categorization algorithms

## Next Steps (Future Phases)

1. **Plugin Architecture**: Add plugin system for specialized features
2. **Advanced Theming**: Dynamic theme switching
3. **Search & Filtering**: Enhanced search capabilities
4. **Data Source Adapters**: Support for other data sources (JSON, GraphQL, etc.)
5. **Component Library**: Standardized, reusable menu components

## Testing the Migration

1. **Backup your current App.vue**: `cp src/App.vue src/App.backup.vue`
2. **Create test version**: Use the example above
3. **Compare output**: Ensure all data appears correctly
4. **Check performance**: Monitor load times and responsiveness
5. **Validate categorization**: Check that beverages are categorized correctly

The new system is designed to be a **drop-in replacement** that maintains all existing functionality while adding powerful new capabilities!