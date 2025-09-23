// Utility functions for organizing beverage data

// Map Airtable beverage type IDs to readable names
const BEVERAGE_TYPE_MAP = {
  'recOW2zHJoiGChTT7': 'Beer',
  'recpQiuWolgTk6pMA': 'Red Wine',
  'recyM0G5uQKbEZmzL': 'White Wine',
  'recd7YaoOUK9j9vMN': 'Rosé Wine',
  'rec0vSnmMvKBvvmca': 'Cocktails',
  'rec4bdv7UX0fkFAAv': 'Hard Seltzer'
}

// Map Airtable beverage category IDs to readable names
// These represent specific varietals/styles within beverage types
const BEVERAGE_CATEGORY_MAP = {
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

// Wine variety keywords for categorization
const RED_WINE_KEYWORDS = [
  'cabernet', 'merlot', 'pinot noir', 'shiraz', 'syrah', 'zinfandel',
  'sangiovese', 'chianti', 'bordeaux', 'burgundy', 'barolo', 'brunello',
  'tempranillo', 'rioja', 'malbec', 'petite sirah', 'red blend'
]

const WHITE_WINE_KEYWORDS = [
  'chardonnay', 'sauvignon blanc', 'pinot grigio', 'pinot gris', 'riesling',
  'moscato', 'gewürztraminer', 'albariño', 'vermentino', 'viognier',
  'sémillon', 'chenin blanc', 'white blend', 'prosecco', 'champagne'
]

const BLUSH_WINE_KEYWORDS = [
  'rosé', 'rose', 'blush', 'pink', 'white zinfandel', 'provence'
]

// Categorize wines into subcategories
function categorizeWine(record) {
  const name = record.fields.Name?.toLowerCase() || ''

  // Check if it's specifically a red wine
  if (RED_WINE_KEYWORDS.some(keyword => name.includes(keyword))) {
    return 'Red'
  }
  // Check if it's specifically a white wine
  if (WHITE_WINE_KEYWORDS.some(keyword => name.includes(keyword))) {
    return 'White'
  }
  // Check if it's specifically a blush/rosé wine
  if (BLUSH_WINE_KEYWORDS.some(keyword => name.includes(keyword))) {
    return 'Blush'
  }

  // Fallback to Airtable beverage type mapping for wines
  const beverageTypeId = record.fields['Beverage Type']?.[0]
  if (beverageTypeId === 'recpQiuWolgTk6pMA') return 'Red'
  if (beverageTypeId === 'recyM0G5uQKbEZmzL') return 'White'
  if (beverageTypeId === 'recd7YaoOUK9j9vMN') return 'Blush'

  return 'Other' // Generic wine subcategory
}

// Categorize beers into subcategories
function categorizeBeer(record) {
  const name = record.fields.Name?.toLowerCase() || ''
  const format = record.fields['Beverage Format'] || []

  // Check for draught/tap keywords
  if (name.includes('draught') || name.includes('draft') || name.includes('tap') ||
      name.includes('glass') || name.includes('pint') || name.includes('snifter')) {
    return 'Draught'
  }

  // Check for bottle/can keywords
  if (name.includes('bottle') || name.includes('can')) {
    return 'Bottles'
  }

  // If we can't determine from name, default to draught for glass servings
  if (name.includes('oz glass') || name.includes('oz snifter')) {
    return 'Draught'
  }

  return 'Other' // Generic beer subcategory
}

// Categorize beverages by inferring from name patterns
function inferBeverageType(record) {
  const name = record.fields.Name?.toLowerCase() || ''
  const categories = record.fields['Beverage Categories (from Beverage Item)'] || []

  // Check for wine keywords
  if (name.includes('wine') ||
      RED_WINE_KEYWORDS.some(keyword => name.includes(keyword)) ||
      WHITE_WINE_KEYWORDS.some(keyword => name.includes(keyword)) ||
      BLUSH_WINE_KEYWORDS.some(keyword => name.includes(keyword))) {
    return 'Wine'
  }

  // Check for beer keywords
  if (name.includes('beer') || name.includes('ale') || name.includes('lager') ||
      name.includes('stout') || name.includes('porter') || name.includes('ipa') ||
      name.includes('draught') || name.includes('pilsner') || name.includes('wheat')) {
    return 'Beer'
  }

  // Check for cocktail keywords
  if (name.includes('cocktail') || name.includes('martini') || name.includes('margarita') ||
      name.includes('mojito') || name.includes('cosmopolitan') || name.includes('collins') ||
      name.includes('sangria') || name.includes('fashioned')) {
    return 'Cocktails'
  }

  // Check for hard seltzer
  if (name.includes('seltzer') || name.includes('white claw') || name.includes('truly')) {
    return 'Hard Seltzer'
  }

  // Check for cider
  if (name.includes('cider') || name.includes('angry orchard')) {
    return 'Cider'
  }

  // Fallback to Airtable beverage type mapping
  const beverageTypeId = record.fields['Beverage Type']?.[0]
  return BEVERAGE_TYPE_MAP[beverageTypeId] || 'Other'
}

// Group beverages by type with wine and beer subcategories
export function groupBeveragesByType(beverages) {
  const grouped = {}

  beverages.forEach(beverage => {
    const type = inferBeverageType(beverage)

    if (type === 'Wine') {
      // Create wine subcategories
      const wineSubcategory = categorizeWine(beverage)
      const wineKey = `Wine - ${wineSubcategory}`

      if (!grouped[wineKey]) {
        grouped[wineKey] = []
      }
      grouped[wineKey].push(beverage)
    } else if (type === 'Beer') {
      // Create beer subcategories
      const beerSubcategory = categorizeBeer(beverage)
      const beerKey = `Beer - ${beerSubcategory}`

      if (!grouped[beerKey]) {
        grouped[beerKey] = []
      }
      grouped[beerKey].push(beverage)
    } else {
      // Handle other beverages normally
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(beverage)
    }
  })

  // Sort each group by name
  Object.keys(grouped).forEach(type => {
    grouped[type].sort((a, b) =>
      (a.fields.Name || '').localeCompare(b.fields.Name || '')
    )
  })

  return grouped
}

// Get beverages sorted by price within each type
export function sortBeveragesByPrice(groupedBeverages, ascending = true) {
  const sorted = {}

  Object.keys(groupedBeverages).forEach(type => {
    sorted[type] = [...groupedBeverages[type]].sort((a, b) => {
      const priceA = a.fields.Price || 0
      const priceB = b.fields.Price || 0
      return ascending ? priceA - priceB : priceB - priceA
    })
  })

  return sorted
}

// Filter beverages by availability
export function filterAvailableBeverages(groupedBeverages) {
  const filtered = {}

  Object.keys(groupedBeverages).forEach(type => {
    filtered[type] = groupedBeverages[type].filter(beverage =>
      beverage.fields['Is valid size?'] === '✅ Valid'
    )
  })

  return filtered
}

// Extract base wine name from full name, including varietal info
function extractWineBaseName(fullName, beverageCategories) {
  // Pattern: "Brand Name - Wine [Format] [Size] [Container] : $Price"
  // Extract everything before " - Wine"
  const match = fullName.match(/^(.+?)\s*-\s*Wine/)
  const baseName = match ? match[1].trim() : fullName

  // Include beverage category to distinguish varietals
  const categoryKey = beverageCategories ? beverageCategories.join('|') : 'unknown'
  return `${baseName}__${categoryKey}`
}

// Parse serving size and format from wine fields
function parseWineServing(wine) {
  // Map format IDs to readable names
  const formatMap = {
    'recDlaYGEmS23x6gB': 'Glass',
    'recJOuYK67z0S23Gg': 'Bottle'
  }

  const formatId = wine.fields['Beverage Format']
  const volume = wine.fields['Volume']
  const price = wine.fields['Price']

  return {
    format: formatId && formatId.length > 0 ? formatMap[formatId[0]] || 'Unknown' : 'Unknown',
    size: volume && volume.length > 0 ? volume[0] : 0,
    container: formatId && formatId.length > 0 ? formatMap[formatId[0]] || 'Unknown' : 'Unknown',
    price: price || 0
  }
}

// Group wines by base name with multiple serving options
export function groupWinesByBaseName(wines) {
  const grouped = {}

  wines.forEach(wine => {
    const beverageCategories = wine.fields['Beverage Categories (from Beverage Item)'] || []
    const groupingKey = extractWineBaseName(wine.fields.Name || '', beverageCategories)
    const serving = parseWineServing(wine)

    // Extract display name (without category suffix for UI)
    const displayName = (wine.fields.Name || '').match(/^(.+?)\s*-\s*Wine/)
      ? (wine.fields.Name || '').match(/^(.+?)\s*-\s*Wine/)[1].trim()
      : wine.fields.Name || ''

    if (!grouped[groupingKey]) {
      grouped[groupingKey] = {
        baseName: displayName,
        wines: [],
        servings: []
      }
    }

    grouped[groupingKey].wines.push(wine)
    grouped[groupingKey].servings.push({
      ...serving,
      fullRecord: wine
    })
  })

  // Sort servings by size (glasses first, then bottles)
  Object.keys(grouped).forEach(groupingKey => {
    grouped[groupingKey].servings.sort((a, b) => {
      // Glasses first, then bottles
      if (a.format !== b.format) {
        return a.format === 'Glass' ? -1 : 1
      }
      // Within same format, sort by size
      return a.size - b.size
    })
  })

  return grouped
}

// Get summary statistics for each beverage type
export function getBeverageStats(groupedBeverages) {
  const stats = {}

  Object.keys(groupedBeverages).forEach(type => {
    const beverages = groupedBeverages[type]
    const prices = beverages.map(b => b.fields.Price || 0).filter(p => p > 0)

    stats[type] = {
      count: beverages.length,
      avgPrice: prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0,
      minPrice: prices.length > 0 ? Math.min(...prices) : 0,
      maxPrice: prices.length > 0 ? Math.max(...prices) : 0
    }
  })

  return stats
}

// Get readable name for beverage category ID
// Note: This function is now a fallback - prefer using the dynamic mapping from useDynamicCategoryMapping
export function getBeverageCategoryName(categoryId) {
  return BEVERAGE_CATEGORY_MAP[categoryId] || `Category ${categoryId.slice(-6)}`
}

// Enhanced function that accepts a dynamic mapping
export function getBeverageCategoryNameWithMapping(categoryId, dynamicMapping) {
  if (!categoryId) return null

  // Use dynamic mapping if provided, otherwise fall back to static mapping
  if (dynamicMapping && dynamicMapping[categoryId]) {
    return dynamicMapping[categoryId]
  }

  return BEVERAGE_CATEGORY_MAP[categoryId] || `Category ${categoryId.slice(-6)}`
}