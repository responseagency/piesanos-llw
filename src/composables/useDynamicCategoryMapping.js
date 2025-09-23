import { computed, ref } from 'vue'

/**
 * Composable for creating dynamic category mappings from beverage data
 * Uses beverage names to intelligently extract category names
 * Falls back to hardcoded mapping when auto-detection fails
 */
export function useDynamicCategoryMapping(beverages) {
  // Fallback hardcoded mapping for categories that can't be auto-detected
  const FALLBACK_CATEGORY_MAP = {
    // Wine categories
    'rec3LMUEO2LYN2cDU': 'Pinot Noir',
    'recyxCfXAkHefadIf': 'Cabernet Sauvignon',
    'recia45ay6ufvUWky': 'Chardonnay',
    'rectFLkwxgzQ3D0KB': 'Merlot',
    'recluaSc08iiIHgyM': 'Sauvignon Blanc',
    'recgXcDaCVLyhzDul': 'Pinot Grigio',
    'recwZEU5BlZE2jtCX': 'Prosecco',
    'recPIvS68Z4TR2UT8': 'Chianti',
    'recbC9MPh4Cb1BQtV': 'Sauvignon Blanc',
    'recER0nyu6RkO2S8x': 'Moscato',
    'rec8AL7hMBEzhHCNz': 'Riesling',
    'recL5neVaKUUJhF2A': 'Riesling',
    'recROGK5Wof47jFVp': 'Rosé',

    // Beer categories
    'recIuYd53dX1ka2i4': 'Pale Ale',
    'recbu1NP9AtX16S1Q': 'IPA',
    'recnQMUG04sDmuqJy': 'Wheat Beer',
    'recZYS1A6usOIwB3T': 'Lager',
    'recccKT3HrfPh2CVj': 'Lager',
    'recE28gqsWn8M8ETS': 'Light Beer',
    'recvpQhHJB3cDsUnr': 'Wheat Beer',
    'recA3lUok7auQaRJk': 'IPA',
    'rectcyZQCYfa0IW2C': 'Wheat Beer',
    'recMe1XhLWGyVJfxt': 'Brown Ale',
    'reclLSiwXVZZ27CTj': 'Hazy IPA',
    'recSvwksArxewbD6X': 'Stout',
    'reclTz3zyDDHMLuSh': 'Lager',
    'rec9op2Thkd4RvlFI': 'Lager',
    'recls75omZ2kEKc1j': 'Light Beer',
    'receLZV64VEF2Vrsz': 'Craft Beer',
    'recHgpD2o2LQKUHGS': 'Wheat Beer',
    'rec04i9SQRRGRTxsY': 'Stout',

    // Cider categories
    'recc31M7zmpwDWWhX': 'Hard Cider',

    // Hard Seltzer categories
    'rectT4swjelSD6IXu': 'Hard Seltzer',

    // Cocktail categories
    'recaYJ43r97bZw8Z2': 'Cocktail',
    'recmfO8mrt0LPRIqj': 'Martini',
  }

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
   * Create a dynamic mapping of category IDs to names based on actual beverage data
   */
  const dynamicCategoryMapping = computed(() => {
    if (!beverages.value || !Array.isArray(beverages.value)) {
      return { ...FALLBACK_CATEGORY_MAP }
    }

    const mapping = { ...FALLBACK_CATEGORY_MAP }
    const categoryAnalysis = new Map() // Track analysis for debugging

    // Analyze each beverage to extract category information
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
      console.log('Dynamic category mapping analysis:', Object.fromEntries(categoryAnalysis))
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
    const discovered = {}
    const fallback = {}

    Object.entries(mapping).forEach(([id, name]) => {
      if (FALLBACK_CATEGORY_MAP[id]) {
        fallback[id] = name
      } else {
        discovered[id] = name
      }
    })

    return { discovered, fallback }
  })

  /**
   * Get statistics about the category mapping
   */
  const mappingStats = computed(() => {
    if (!beverages.value) {
      return {
        totalCategories: 0,
        dynamicallyMapped: 0,
        fallbackMapped: 0,
        unmapped: 0
      }
    }

    const allCategoryIds = new Set()
    beverages.value.forEach(beverage => {
      const categories = beverage.fields?.['Beverage Categories (from Beverage Item)'] || []
      categories.forEach(id => allCategoryIds.add(id))
    })

    const mapping = dynamicCategoryMapping.value
    let dynamicallyMapped = 0
    let fallbackMapped = 0
    let unmapped = 0

    allCategoryIds.forEach(id => {
      if (mapping[id]) {
        if (FALLBACK_CATEGORY_MAP[id]) {
          fallbackMapped++
        } else {
          dynamicallyMapped++
        }
      } else {
        unmapped++
      }
    })

    return {
      totalCategories: allCategoryIds.size,
      dynamicallyMapped,
      fallbackMapped,
      unmapped
    }
  })

  return {
    getCategoryName,
    dynamicCategoryMapping,
    discoveredCategories,
    mappingStats,
    extractCategoryFromName
  }
}