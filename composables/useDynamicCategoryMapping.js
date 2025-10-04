import { computed, ref } from 'vue'
import { useLookupMappings } from './useLookupMappings.js'

/**
 * Composable for creating dynamic category mappings from beverage data
 * Uses server lookup mappings combined with intelligent name extraction
 * Falls back to pattern-based detection when lookup fails
 */
export function useDynamicCategoryMapping(beverages) {
  const { categories: serverCategories, isReady } = useLookupMappings()

  // Lookup mappings are pre-loaded via SSG - no need to fetch from API

  // Wine varietal patterns for extraction
  const WINE_PATTERNS = [
    // Common wine varietals - order matters for specificity
    { pattern: /\b(cabernet\s+sauvignon|cab\s+sauv)\b/i, name: 'Cabernet Sauvignon' },
    { pattern: /\b(sauvignon\s+blanc|sauv\s+blanc)\b/i, name: 'Sauvignon Blanc' },
    { pattern: /\b(pinot\s+noir)\b/i, name: 'Pinot Noir' },
    { pattern: /\b(pinot\s+grigio|pinot\s+gris)\b/i, name: 'Pinot Grigio' },
    { pattern: /\b(chardonnay|chard)\b/i, name: 'Chardonnay' },
    { pattern: /\bmerlot\b/i, name: 'Merlot' },
    { pattern: /\briesling\b/i, name: 'Riesling' },
    { pattern: /\bmoscato\b/i, name: 'Moscato' },
    { pattern: /\bprosecco\b/i, name: 'Prosecco' },
    { pattern: /\bchianti\b/i, name: 'Chianti' },
    { pattern: /\brosé|rose\b/i, name: 'Rosé' },
    { pattern: /\bmalbec\b/i, name: 'Malbec' },
    { pattern: /\bzinfandel\b/i, name: 'Zinfandel' },
    { pattern: /\bshiraz|syrah\b/i, name: 'Shiraz' },
    { pattern: /\btempranillo\b/i, name: 'Tempranillo' },
    { pattern: /\bsangiovese\b/i, name: 'Sangiovese' },
    { pattern: /\bgewürztraminer\b/i, name: 'Gewürztraminer' },
    { pattern: /\balbariño\b/i, name: 'Albariño' },
    { pattern: /\bviognier\b/i, name: 'Viognier' },
    { pattern: /\bchampagne\b/i, name: 'Champagne' },
    { pattern: /\bcava\b/i, name: 'Cava' },
    { pattern: /\bbrunello\b/i, name: 'Brunello' },
    { pattern: /\bbarolo\b/i, name: 'Barolo' },
    { pattern: /\bbourgundy\b/i, name: 'Burgundy' },
    { pattern: /\bbordeaux\b/i, name: 'Bordeaux' },
  ]

  // Beer style patterns for extraction
  const BEER_PATTERNS = [
    // Specific beer styles - order matters for specificity
    { pattern: /\b(double\s+ipa|imperial\s+ipa|dipa)\b/i, name: 'Double IPA' },
    { pattern: /\b(hazy\s+ipa|new\s+england\s+ipa|neipa)\b/i, name: 'Hazy IPA' },
    { pattern: /\b(session\s+ipa)\b/i, name: 'Session IPA' },
    { pattern: /\b(west\s+coast\s+ipa)\b/i, name: 'West Coast IPA' },
    { pattern: /\bipa\b/i, name: 'IPA' },
    { pattern: /\b(pale\s+ale)\b/i, name: 'Pale Ale' },
    { pattern: /\b(wheat\s+beer|hefeweizen|witbier)\b/i, name: 'Wheat Beer' },
    { pattern: /\b(light\s+beer|lite\s+beer)\b/i, name: 'Light Beer' },
    { pattern: /\b(brown\s+ale)\b/i, name: 'Brown Ale' },
    { pattern: /\b(amber\s+ale)\b/i, name: 'Amber Ale' },
    { pattern: /\b(red\s+ale)\b/i, name: 'Red Ale' },
    { pattern: /\bstout\b/i, name: 'Stout' },
    { pattern: /\bporter\b/i, name: 'Porter' },
    { pattern: /\blager\b/i, name: 'Lager' },
    { pattern: /\bpilsner\b/i, name: 'Pilsner' },
    { pattern: /\bsaison\b/i, name: 'Saison' },
    { pattern: /\bgose\b/i, name: 'Gose' },
    { pattern: /\bsour\b/i, name: 'Sour Beer' },
    { pattern: /\b(craft\s+beer)\b/i, name: 'Craft Beer' },
  ]

  // Cocktail patterns for extraction
  const COCKTAIL_PATTERNS = [
    { pattern: /\bmartini\b/i, name: 'Martini' },
    { pattern: /\bmargarita\b/i, name: 'Margarita' },
    { pattern: /\bmojito\b/i, name: 'Mojito' },
    { pattern: /\bcosmopolitan\b/i, name: 'Cosmopolitan' },
    { pattern: /\b(old\s+fashioned)\b/i, name: 'Old Fashioned' },
    { pattern: /\bmanhattan\b/i, name: 'Manhattan' },
    { pattern: /\bnegroni\b/i, name: 'Negroni' },
    { pattern: /\bsangria\b/i, name: 'Sangria' },
    { pattern: /\bmimosa\b/i, name: 'Mimosa' },
    { pattern: /\bbellini\b/i, name: 'Bellini' },
    { pattern: /\bcocktail\b/i, name: 'Cocktail' },
  ]

  /**
   * Extract category name from beverage name using pattern matching
   */
  function extractCategoryFromName(beverageName, beverageType) {
    if (!beverageName) return null

    const name = beverageName.toLowerCase()

    // Safely handle beverageType - could be string, array, or null
    const typeString = beverageType
      ? (Array.isArray(beverageType) ? beverageType[0] : String(beverageType)).toLowerCase()
      : ''

    // Check wine patterns
    if (typeString.includes('wine') || name.includes('wine')) {
      for (const { pattern, name: categoryName } of WINE_PATTERNS) {
        if (pattern.test(name)) {
          return categoryName
        }
      }
    }

    // Check beer patterns
    if (typeString.includes('beer') ||
        name.includes('beer') || name.includes('ale') || name.includes('lager') ||
        name.includes('ipa') || name.includes('stout') || name.includes('porter')) {
      for (const { pattern, name: categoryName } of BEER_PATTERNS) {
        if (pattern.test(name)) {
          return categoryName
        }
      }
    }

    // Check cocktail patterns
    if (typeString.includes('cocktail') ||
        name.includes('cocktail') || name.includes('martini') || name.includes('margarita')) {
      for (const { pattern, name: categoryName } of COCKTAIL_PATTERNS) {
        if (pattern.test(name)) {
          return categoryName
        }
      }
    }

    return null
  }

  /**
   * Create a dynamic mapping of category IDs to names based on server lookup + pattern extraction
   */
  const dynamicCategoryMapping = computed(() => {
    // Start with server categories as the primary source
    const mapping = { ...serverCategories.value }

    if (!beverages.value || !Array.isArray(beverages.value)) {
      return mapping
    }

    const categoryAnalysis = new Map() // Track analysis for debugging

    // For any categories not found in server lookup, try pattern extraction
    beverages.value.forEach(beverage => {
      const categories = beverage.fields?.['Beverage Categories (from Beverage Item)'] || []
      const beverageName = beverage.fields?.Name || ''
      const beverageType = beverage.fields?.['Beverage Type'] || ''

      categories.forEach(categoryId => {
        if (!categoryId || mapping[categoryId]) return // Skip if already mapped

        // Try to extract category name from beverage name
        const extractedName = extractCategoryFromName(beverageName, beverageType)

        if (extractedName) {
          mapping[categoryId] = extractedName

          // Track analysis for debugging
          if (!categoryAnalysis.has(categoryId)) {
            categoryAnalysis.set(categoryId, {
              extractedName,
              examples: []
            })
          }
          categoryAnalysis.get(categoryId).examples.push(beverageName)
        }
      })
    })

    // Debug logging in development
    if (import.meta.env.DEV && categoryAnalysis.size > 0) {
      console.log('Pattern-extracted category mappings:', Object.fromEntries(categoryAnalysis))
    }

    if (import.meta.env.DEV) {
      console.log('Final category mappings (server + patterns):', mapping)
    }

    return mapping
  })

  /**
   * Get readable name for a category ID
   */
  function getCategoryName(categoryId) {
    if (!categoryId) return null

    const mapping = dynamicCategoryMapping.value
    return mapping[categoryId] || `Category ${categoryId.slice(-6)}`
  }

  /**
   * Get all discovered categories with their mappings
   */
  const discoveredCategories = computed(() => {
    const mapping = dynamicCategoryMapping.value
    const serverMapped = {}
    const patternMapped = {}

    Object.entries(mapping).forEach(([id, name]) => {
      if (serverCategories.value[id]) {
        serverMapped[id] = name
      } else {
        patternMapped[id] = name
      }
    })

    return {
      serverMapped,
      patternMapped,
      // Keep legacy names for backwards compatibility
      discovered: patternMapped,
      fallback: serverMapped
    }
  })

  /**
   * Get statistics about the category mapping
   */
  const mappingStats = computed(() => {
    if (!beverages.value) {
      return {
        totalCategories: 0,
        serverMapped: 0,
        patternMapped: 0,
        unmapped: 0
      }
    }

    const allCategoryIds = new Set()
    beverages.value.forEach(beverage => {
      const categories = beverage.fields?.['Beverage Categories (from Beverage Item)'] || []
      categories.forEach(id => allCategoryIds.add(id))
    })

    const mapping = dynamicCategoryMapping.value
    let serverMapped = 0
    let patternMapped = 0
    let unmapped = 0

    allCategoryIds.forEach(id => {
      if (mapping[id]) {
        if (serverCategories.value[id]) {
          serverMapped++
        } else {
          patternMapped++
        }
      } else {
        unmapped++
      }
    })

    return {
      totalCategories: allCategoryIds.size,
      serverMapped,
      patternMapped,
      unmapped,
      // Legacy names for backwards compatibility
      dynamicallyMapped: patternMapped,
      fallbackMapped: serverMapped
    }
  })

  // Get all available beverage types
  const availableTypes = computed(() => {
    if (!beverages.value || !Array.isArray(beverages.value)) {
      return []
    }

    const typesSet = new Set()
    beverages.value.forEach(beverage => {
      const type = beverage.fields?.['Beverage Type']
      if (type) {
        if (Array.isArray(type)) {
          type.forEach(t => typesSet.add(t))
        } else {
          typesSet.add(type)
        }
      }
    })

    return Array.from(typesSet).sort()
  })

  // Get available categories for selected type
  const selectedType = ref(null)
  const selectedCategory = ref(null)

  const availableCategories = computed(() => {
    if (!beverages.value || !Array.isArray(beverages.value)) {
      return []
    }

    const categoriesSet = new Set()
    const filteredBeverages = selectedType.value
      ? beverages.value.filter(beverage => {
          const type = beverage.fields?.['Beverage Type']
          if (Array.isArray(type)) {
            return type.includes(selectedType.value)
          }
          return type === selectedType.value
        })
      : beverages.value

    filteredBeverages.forEach(beverage => {
      const categories = beverage.fields?.['Beverage Categories (from Beverage Item)'] || []
      categories.forEach(categoryId => {
        if (categoryId) {
          categoriesSet.add(categoryId)
        }
      })
    })

    return Array.from(categoriesSet)
      .map(id => ({
        id,
        name: getCategoryName(id)
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  })

  // Filter beverages by selected type and category
  const filteredByCategory = computed(() => {
    if (!beverages.value || !Array.isArray(beverages.value)) {
      return []
    }

    let filtered = beverages.value

    // Filter by type if selected
    if (selectedType.value) {
      filtered = filtered.filter(beverage => {
        const type = beverage.fields?.['Beverage Type']
        if (Array.isArray(type)) {
          return type.includes(selectedType.value)
        }
        return type === selectedType.value
      })
    }

    // Filter by category if selected
    if (selectedCategory.value) {
      filtered = filtered.filter(beverage => {
        const categories = beverage.fields?.['Beverage Categories (from Beverage Item)'] || []
        return categories.includes(selectedCategory.value)
      })
    }

    return filtered
  })

  return {
    getCategoryName,
    dynamicCategoryMapping,
    discoveredCategories,
    mappingStats,
    extractCategoryFromName,
    // Filter/selection functionality
    availableTypes,
    availableCategories,
    selectedType,
    selectedCategory,
    filteredByCategory
  }
}