// Streamlined beverage organization utilities
// This file now focuses on wine-specific grouping and essential utility functions.
// The hierarchical grouping system handles most beverage categorization.

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
export function categorizeWine(record) {
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

  // Fallback to resolved beverage type for wines
  const resolvedType = record.fields['Beverage Type Resolved']?.[0]
  if (resolvedType === 'Red Wine') return 'Red'
  if (resolvedType === 'White Wine') return 'White'
  if (resolvedType === 'Blush') return 'Blush'

  return 'Other' // Generic wine subcategory
}

// Categorize beers into subcategories (used by hierarchical organizer)
export function categorizeBeer(record) {
  const name = record.fields.Name?.toLowerCase() || ''

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

// Basic beverage type inference (used by hierarchical organizer as fallback)
export function inferBeverageType(record, typeMapping = {}) {
  const name = record.fields.Name?.toLowerCase() || ''

  // Check resolved type first (preferred method)
  const resolvedType = record.fields['Beverage Type Resolved']?.[0]
  if (resolvedType) {
    return resolvedType
  }

  // Fallback to name-based inference for edge cases
  if (name.includes('wine') ||
      RED_WINE_KEYWORDS.some(keyword => name.includes(keyword)) ||
      WHITE_WINE_KEYWORDS.some(keyword => name.includes(keyword)) ||
      BLUSH_WINE_KEYWORDS.some(keyword => name.includes(keyword))) {
    return 'Wine'
  }

  if (name.includes('beer') || name.includes('ale') || name.includes('lager') ||
      name.includes('stout') || name.includes('porter') || name.includes('ipa') ||
      name.includes('draught') || name.includes('pilsner') || name.includes('wheat')) {
    return 'Beer'
  }

  if (name.includes('cocktail') || name.includes('martini') || name.includes('margarita') ||
      name.includes('mojito') || name.includes('cosmopolitan') || name.includes('collins') ||
      name.includes('sangria') || name.includes('fashioned')) {
    return 'Cocktails'
  }

  if (name.includes('seltzer') || name.includes('white claw') || name.includes('truly')) {
    return 'Hard Seltzer'
  }

  if (name.includes('cider') || name.includes('angry orchard')) {
    return 'Cider'
  }

  return 'Other'
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
function parseWineServing(wine, formatMapping = {}) {
  const formatId = wine.fields['Beverage Format']
  const volume = wine.fields['Volume']
  const price = wine.fields['Price']

  // Use resolved format if available, otherwise fall back to mapping
  const formatName = wine.fields['Beverage Format Resolved']?.[0] ||
    (formatId && formatId.length > 0 ? formatMapping[formatId[0]] : null) ||
    'Unknown'

  return {
    format: formatName,
    size: volume && volume.length > 0 ? volume[0] : 0,
    container: formatName,
    price: price || 0
  }
}

// Group wines by base name with multiple serving options
export function groupWinesByBaseName(wines, formatMapping = {}) {
  const grouped = {}

  wines.forEach(wine => {
    const beverageCategories = wine.fields['Beverage Categories Resolved'] ||
      wine.fields['Beverage Categories (from Beverage Item)'] || []
    const groupingKey = extractWineBaseName(wine.fields.Name || '', beverageCategories)
    const serving = parseWineServing(wine, formatMapping)

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

// Get readable name for beverage category using resolved fields or mapping
export function getBeverageCategoryName(categoryId, categoryMapping = {}) {
  if (!categoryId) return null

  // If it's already a resolved name (string), return it
  if (typeof categoryId === 'string' && !categoryId.startsWith('rec')) {
    return categoryId
  }

  // Otherwise use the mapping for IDs
  return categoryMapping[categoryId] || `Category ${categoryId.slice(-6)}`
}

// Filter beverages by location availability
export function filterBeveragesByLocation(groupedBeverages, selectedLocationId) {
  if (!selectedLocationId) return groupedBeverages

  const filtered = {}

  Object.keys(groupedBeverages).forEach(type => {
    filtered[type] = groupedBeverages[type].filter(beverage => {
      const unavailableLocations = beverage.fields['Unavailable Locations'] || []
      return !unavailableLocations.includes(selectedLocationId)
    })
  })

  return filtered
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

// Group beverages by type with wine and beer subcategories
export function groupBeveragesByType(beverages, typeMapping = {}) {
  const grouped = {}

  beverages.forEach(beverage => {
    const type = inferBeverageType(beverage, typeMapping)

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

// Combined filter function for both availability and location
export function filterBeverages(groupedBeverages, options = {}) {
  const {
    showOnlyAvailable = false,
    selectedLocationId = null,
    customFilter = null
  } = options

  let filtered = { ...groupedBeverages }

  // Apply location filter first
  if (selectedLocationId) {
    filtered = filterBeveragesByLocation(filtered, selectedLocationId)
  }

  // Apply availability filter
  if (showOnlyAvailable) {
    filtered = filterAvailableBeverages(filtered)
  }

  // Apply custom filter if provided
  if (customFilter && typeof customFilter === 'function') {
    const customFiltered = {}
    Object.keys(filtered).forEach(type => {
      customFiltered[type] = filtered[type].filter(customFilter)
    })
    filtered = customFiltered
  }

  return filtered
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