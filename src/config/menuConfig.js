/**
 * @fileoverview Core menu system configuration
 * This file defines the structure and behavior of the reusable menu system
 */

/**
 * @typedef {Object} CategoryConfig
 * @property {string} key - Unique identifier for the category
 * @property {string} label - Display name for the category
 * @property {string[]} keywords - Keywords for automatic categorization
 * @property {string} icon - Icon identifier (optional)
 * @property {number} order - Display order priority
 * @property {Object} styling - Category-specific styling options
 */

/**
 * @typedef {Object} MenuTypeConfig
 * @property {string} key - Unique identifier for the menu type
 * @property {string} label - Display name for the menu type
 * @property {CategoryConfig[]} categories - Available categories for this type
 * @property {Object} grouping - Grouping rules and logic
 * @property {Object} display - Display configuration
 * @property {Object} plugins - Type-specific plugins and features
 */

/**
 * @typedef {Object} MenuSystemConfig
 * @property {string} name - Menu system name
 * @property {Object} dataAdapter - Data source configuration
 * @property {MenuTypeConfig[]} menuTypes - Available menu types
 * @property {Object} theme - Global theme configuration
 * @property {Object} features - Feature flags and global options
 */

/**
 * Default beverage menu configuration
 * This serves as the base configuration for the current beverage menu
 * and demonstrates how to configure a reusable menu system
 */
export const beverageMenuConfig = {
  name: 'Beverage Menu System',

  // Data adapter configuration
  dataAdapter: {
    type: 'airtable',
    endpoint: 'http://localhost:3002/api/airtable',
    fieldMappings: {
      name: 'Name',
      price: 'Price',
      availability: 'Is valid size?',
      type: 'Beverage Type',
      categories: 'Beverage Categories (from Beverage Item)',
      format: 'Beverage Format'
    },
    availabilityValue: '✅ Valid'
  },

  // Menu type definitions
  menuTypes: {
    wine: {
      key: 'wine',
      label: 'Wine',
      categories: {
        red: {
          key: 'red',
          label: 'Red',
          keywords: [
            'cabernet', 'merlot', 'pinot noir', 'shiraz', 'syrah', 'zinfandel',
            'sangiovese', 'chianti', 'bordeaux', 'burgundy', 'barolo', 'brunello',
            'tempranillo', 'rioja', 'malbec', 'petite sirah', 'red blend'
          ],
          order: 1,
          styling: {
            headerColor: 'bg-red-100 border-red-200',
            textColor: 'text-red-800',
            accent: 'text-red-600'
          }
        },
        white: {
          key: 'white',
          label: 'White',
          keywords: [
            'chardonnay', 'sauvignon blanc', 'pinot grigio', 'pinot gris', 'riesling',
            'moscato', 'gewürztraminer', 'albariño', 'vermentino', 'viognier',
            'sémillon', 'chenin blanc', 'white blend', 'prosecco', 'champagne'
          ],
          order: 2,
          styling: {
            headerColor: 'bg-yellow-50 border-yellow-200',
            textColor: 'text-yellow-800',
            accent: 'text-yellow-600'
          }
        },
        blush: {
          key: 'blush',
          label: 'Blush',
          keywords: ['rosé', 'rose', 'blush', 'pink', 'white zinfandel', 'provence'],
          order: 3,
          styling: {
            headerColor: 'bg-pink-50 border-pink-200',
            textColor: 'text-pink-800',
            accent: 'text-pink-600'
          }
        },
        other: {
          key: 'other',
          label: 'Other',
          keywords: [],
          order: 4,
          styling: {
            headerColor: 'bg-purple-50 border-purple-200',
            textColor: 'text-purple-800',
            accent: 'text-purple-600'
          }
        }
      },
      grouping: {
        strategy: 'multi-serving', // Group by base wine with multiple serving options
        namePattern: /^(.+?)\s*-\s*Wine/,
        servingFormats: ['Glass', 'Bottle', 'Mini Bottle']
      },
      display: {
        showGroupedItems: true,
        showServingSizes: true,
        showPriceRange: true,
        sortBy: 'name'
      },
      plugins: ['wineGrouping', 'servingOptions', 'vintageInfo']
    },

    beer: {
      key: 'beer',
      label: 'Beer',
      categories: {
        draught: {
          key: 'draught',
          label: 'Draught',
          keywords: ['draught', 'draft', 'tap', 'glass', 'pint', 'snifter', 'oz glass'],
          order: 1,
          styling: {
            headerColor: 'bg-amber-50 border-amber-200',
            textColor: 'text-amber-800',
            accent: 'text-amber-600'
          }
        },
        bottles: {
          key: 'bottles',
          label: 'Bottles',
          keywords: ['bottle', 'can'],
          order: 2,
          styling: {
            headerColor: 'bg-brown-50 border-brown-200',
            textColor: 'text-brown-800',
            accent: 'text-brown-600'
          }
        },
        other: {
          key: 'other',
          label: 'Other',
          keywords: [],
          order: 3,
          styling: {
            headerColor: 'bg-orange-50 border-orange-200',
            textColor: 'text-orange-800',
            accent: 'text-orange-600'
          }
        }
      },
      grouping: {
        strategy: 'simple', // Simple categorization
        detectByKeywords: true
      },
      display: {
        showGroupedItems: false,
        showAbv: true,
        showBrewery: true,
        sortBy: 'name'
      },
      plugins: ['beerStyles', 'alcoholContent']
    },

    cocktails: {
      key: 'cocktails',
      label: 'Cocktails',
      categories: {
        classic: {
          key: 'classic',
          label: 'Classic',
          keywords: ['martini', 'manhattan', 'old fashioned', 'negroni'],
          order: 1,
          styling: {
            headerColor: 'bg-blue-50 border-blue-200',
            textColor: 'text-blue-800',
            accent: 'text-blue-600'
          }
        },
        contemporary: {
          key: 'contemporary',
          label: 'Contemporary',
          keywords: ['cosmopolitan', 'mojito', 'margarita'],
          order: 2,
          styling: {
            headerColor: 'bg-green-50 border-green-200',
            textColor: 'text-green-800',
            accent: 'text-green-600'
          }
        }
      },
      grouping: {
        strategy: 'simple'
      },
      display: {
        showIngredients: true,
        showAlcoholContent: true,
        sortBy: 'name'
      },
      plugins: ['cocktailRecipes', 'garnishInfo']
    },

    other: {
      key: 'other',
      label: 'Other Beverages',
      categories: {
        hardSeltzer: {
          key: 'hardSeltzer',
          label: 'Hard Seltzer',
          keywords: ['seltzer', 'white claw', 'truly'],
          order: 1,
          styling: {
            headerColor: 'bg-cyan-50 border-cyan-200',
            textColor: 'text-cyan-800',
            accent: 'text-cyan-600'
          }
        },
        cider: {
          key: 'cider',
          label: 'Cider',
          keywords: ['cider', 'angry orchard'],
          order: 2,
          styling: {
            headerColor: 'bg-green-50 border-green-200',
            textColor: 'text-green-800',
            accent: 'text-green-600'
          }
        },
        misc: {
          key: 'misc',
          label: 'Miscellaneous',
          keywords: [],
          order: 3,
          styling: {
            headerColor: 'bg-gray-50 border-gray-200',
            textColor: 'text-gray-800',
            accent: 'text-gray-600'
          }
        }
      },
      grouping: {
        strategy: 'simple'
      },
      display: {
        sortBy: 'name'
      },
      plugins: []
    }
  },

  // Legacy type mappings for backward compatibility
  legacyTypeMappings: {
    'recOW2zHJoiGChTT7': 'beer',
    'recpQiuWolgTk6pMA': 'wine',
    'recyM0G5uQKbEZmzL': 'wine',
    'recd7YaoOUK9j9vMN': 'wine',
    'rec0vSnmMvKBvvmca': 'cocktails',
    'rec4bdv7UX0fkFAAv': 'other'
  },

  // Global theme configuration
  theme: {
    primaryColor: 'blue',
    secondaryColor: 'gray',
    borderRadius: 'rounded-lg',
    spacing: {
      section: 'space-y-8',
      item: 'space-y-4',
      padding: 'p-6'
    },
    shadows: 'shadow-sm',
    transitions: 'transition-all duration-200'
  },

  // Feature flags and global options
  features: {
    enableFiltering: true,
    enableSorting: true,
    enableStats: true,
    enableDynamicCategoryMapping: true,
    enableAvailabilityFilter: true,
    enablePriceDisplay: true,
    showLastUpdated: true,
    enableSearch: false // Future feature
  },

  // Display order for menu types
  displayOrder: ['wine', 'beer', 'cocktails', 'other'],

  // Stats configuration
  stats: {
    showOverview: true,
    showPerCategory: true,
    showMappingStats: true,
    calculatedFields: ['count', 'avgPrice', 'minPrice', 'maxPrice']
  }
}

/**
 * Get menu type configuration by key
 * @param {string} typeKey - The menu type key
 * @returns {MenuTypeConfig|null} The menu type configuration or null if not found
 */
export function getMenuTypeConfig(typeKey) {
  return beverageMenuConfig.menuTypes[typeKey] || null
}

/**
 * Get category configuration by type and category key
 * @param {string} typeKey - The menu type key
 * @param {string} categoryKey - The category key
 * @returns {CategoryConfig|null} The category configuration or null if not found
 */
export function getCategoryConfig(typeKey, categoryKey) {
  const menuType = getMenuTypeConfig(typeKey)
  return menuType?.categories[categoryKey] || null
}

/**
 * Get all available menu types in display order
 * @returns {MenuTypeConfig[]} Array of menu type configurations
 */
export function getOrderedMenuTypes() {
  return beverageMenuConfig.displayOrder.map(key => ({
    ...beverageMenuConfig.menuTypes[key],
    key
  }))
}

/**
 * Check if a feature is enabled
 * @param {string} featureKey - The feature key to check
 * @returns {boolean} True if the feature is enabled
 */
export function isFeatureEnabled(featureKey) {
  return beverageMenuConfig.features[featureKey] || false
}