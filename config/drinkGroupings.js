// Simplified drink grouping configuration
// Three main sections with all beverages shown for now
//
// Location Filtering:
// - include: array of location numbers where this group SHOULD appear (takes priority)
// - exclude: array of location numbers where this group should NOT appear
// - If both are present, include takes priority
// - If neither are present, group appears at all locations

export const DRINK_GROUPINGS = {
  // Section 1: ON TAP
  'on-tap': {
    title: 'ON TAP',
    subtitle: '40+ Beers on Tap',
    order: 1,
    groups: {
      'sampler': {
        title: 'Sampler',
        order: 1,
        isCustomGroup: true,
        customItems: [
          {
            title: 'You Pick',
            cost: 9,
            text: 'Choose any 4 draft beers',
            size: '5.5oz pours'
          },
          {
            title: "Manager's Choice",
            cost: 8,
            text: '4 draft beers chosen for you',
            size: '5.5oz pours'
          }
        ]
      },
      'cider': {
        title: 'Cider',
        order: 2,
        showAll: true,
        beverageCategories: ['Cider'],
        beverageFormat: 'Draught'
      },
      'ales-lagers-stouts': {
        title: 'Ales, Lagers & Pilsners',
        order: 3,
        include: [3],
        showAll: true,
        beverageCategories: [
          'Lager',
          'Hazy IPA',
          'Boston Lager',
          'Mexican Lager',
          'Irish Red Ale',
          'Cream Ale',
          'Golden Ale',
          'Pale Ale',
          'Euro Pale Lager',
          'Traditional Lager',
          'Pale Lager',
          'Pilsner',
        ],
        beverageFormat: 'Draught'
      },
      'browns-stouts': {
        title: 'Browns & Stouts',
        order: 4,
        include: [3],
        showAll: true,
        beverageCategories: [
          'English Mild Ale',
          'Brown Ale',
          'Stout'
        ],
        beverageFormat: 'Draught'
      },
      'wheat-wit-weiss': {
        title: 'Wheat, Wit & Weiss',
        order: 5,
        include: [3],
        showAll: true,
        beverageCategories: [
          'Belgian Wheat Ale',
          'Hefeweizen',
          'Mango Wheat Ale',
          'Weissbier',
          'Witbier',
          'Wheat Ale',
          'Hefe Weissbier'
        ],
        beverageFormat: 'Draught'
      },
      'ambers-reds': {
        title: 'Ambers & Reds',
        order: 6,
        include: [3],
        showAll: true,
        beverageCategories: [
          'Amber Ale',
          'Irish Red Ale'
        ],
        beverageFormat: 'Draught'
      },
      'ipas': {
        title: 'IPAs',
        order: 7,
        include: [3],
        showAll: true,
        beverageCategories: [
          'American IPA',
          'Double IPA',
          'Hazy IPA',
          'Imperial IPA',
          'New England IPA'
        ],
        beverageFormat: 'Draught'
      },
      'draught-beer': {
        title: 'Draught Beer',
        order: 7,
        exclude: [3],
        showAll: true,
        beverageType: 'Beer',
        beverageFormat: 'Draught'
      }
    }
  },


  // Section 2: BOTTLED
  'bottled': {
    title: 'BOTTLED',
    subtitle: 'Classic Favorites',
    order: 2,
    groups: {
      'bottled-beer': {
        order: 1,
        showAll: true,
        beverageType: [
          'Beer',
          'Cider & RTD'
        ],
        beverageFormat: [
          'Bottle',
          'Can'
        ]
      }
    }
  },

  // Section 3: WINE
  'wine': {
    title: 'WINE',
    subtitle: '6oz Glass / 9oz Glass / Bottle',
    order: 3,
    groups: {
      'red-wines': {
        title: 'Red Wines',
        order: 1,
        showAll: true,
        beverageType: 'Red Wine'
      },
      'white-wines': {
        title: 'White Wines',
        order: 2,
        showAll: true,
        beverageType: 'White Wine'
      },
      'blush-wines': {
        title: 'Blush & Rosé',
        order: 3,
        showAll: true,
        beverageType: 'Blush'
      }
    }
  },

  // Section 4: COCKTAILS
  'cocktails': {
    title: 'COCKTAILS',
    subtitle: 'Shaken, stirred and unforgettable',
    order: 4,
    groups: {
      'cocktails': {
        title: 'Signature Cocktails',
        order: 1,
        showAll: true,
        beverageCategories: [
          'Signature Cocktails'
        ],
        beverageType: 'Cocktails'
      },
      'martinis': {
        title: 'Martinis',
        order: 2,
        showAll: true,
        beverageCategories: [
          'Martinis'
        ],
        beverageType: 'Cocktails'
      }
    },
  }
}

// Helper function to get all sections sorted by order
export function getSections() {
  return Object.entries(DRINK_GROUPINGS)
    .sort(([,a], [,b]) => a.order - b.order)
    .map(([key, section]) => ({
      id: key,
      ...section
    }))
}

// Helper function to get groups for a section sorted by order
export function getGroupsForSection(sectionId) {
  const section = DRINK_GROUPINGS[sectionId]
  if (!section) return []

  return Object.entries(section.groups)
    .sort(([,a], [,b]) => a.order - b.order)
    .map(([key, group]) => ({
      id: key,
      sectionId,
      ...group
    }))
}

// Helper function to get all groups from all sections in order
export function getAllGroups() {
  const allGroups = []
  const sections = getSections()

  sections.forEach(section => {
    const groups = getGroupsForSection(section.id)
    groups.forEach(group => {
      allGroups.push({
        ...group,
        combinedId: `${section.id}-${group.id}`,
        sectionTitle: section.title
      })
    })
  })

  return allGroups
}

// Helper function to check if a group should be shown at a specific location
export function shouldShowGroupAtLocation(group, locationNumber) {
  // If no location number provided, show the group
  if (!locationNumber) {
    return true
  }

  // If include array exists, only show at those locations
  if (group.include && Array.isArray(group.include)) {
    return group.include.includes(locationNumber)
  }

  // If exclude array exists, hide at those locations
  if (group.exclude && Array.isArray(group.exclude)) {
    return !group.exclude.includes(locationNumber)
  }

  // No filtering rules, show everywhere
  return true
}

// Helper function to check if a beverage belongs to a specific group
export function beverageBelongsToGroup(beverage, group, categoryMapping = null) {
  // Skip custom groups - they don't use Airtable data
  if (group.isCustomGroup) {
    return false
  }

  // For groups with showAll=true, check if beverage matches the criteria
  if (group.showAll) {
    const beverageName = beverage.fields.Name || 'Unknown'

    // Debug logging for specific groups
    if (group.title === 'Cider' || group.title === 'Wheat, Wit & Weiss') {
      console.log(`🍺 Checking beverage "${beverageName}" for ${group.title} group:`)
      console.log(`  - Full beverage data:`, beverage.fields)
      console.log(`  - Unavailable Locations:`, beverage.fields['Unavailable Locations'])
    }

    // Check beverage type if specified
    if (group.beverageType) {
      // Use the resolved Beverage Type field from Airtable instead of inferring
      const resolvedType = beverage.fields['Beverage Type Resolved']
      const beverageTypeArray = Array.isArray(resolvedType) ? resolvedType : (resolvedType ? [resolvedType] : [])
      const beverageType = beverageTypeArray.length > 0 ? beverageTypeArray[0] : null

      // Handle both string and array for group.beverageType
      const groupTypes = Array.isArray(group.beverageType) ? group.beverageType : [group.beverageType]

      if (group.title === 'Cider' || group.title === 'Wheat, Wit & Weiss' || group.title === 'Draught Beer') {
        console.log(`  - Beverage type (resolved): "${beverageType}", Required: ${JSON.stringify(groupTypes)}`)
        console.log(`  - Raw Beverage Type field:`, beverage.fields['Beverage Type'])
        console.log(`  - Resolved Beverage Type:`, resolvedType)
      }

      if (!beverageType || !groupTypes.includes(beverageType)) {
        // Fallback to name-based inference if resolved type is not available
        const inferredType = inferBeverageTypeBasic(beverage)
        if (!groupTypes.includes(inferredType)) {
          return false
        }
      }
    }

    // Check beverage categories if specified
    if (group.beverageCategories) {
      // Try the resolved categories first, fall back to IDs if needed
      const resolvedCategories = beverage.fields['Beverage Categories Resolved']
      const beverageCategories = resolvedCategories || beverage.fields['Beverage Categories (from Beverage Item)']

      if (group.title === 'Cider' || group.title === 'Wheat, Wit & Weiss') {
        console.log(`  - Beverage categories (resolved): ${JSON.stringify(resolvedCategories)}`)
        console.log(`  - Beverage categories (IDs): ${JSON.stringify(beverage.fields['Beverage Categories (from Beverage Item)'])}`)
        console.log(`  - Required: ${JSON.stringify(group.beverageCategories)}`)
      }

      // Handle both single values and arrays for category matching
      const categoryArray = Array.isArray(beverageCategories) ? beverageCategories : [beverageCategories]
      const hasMatchingCategory = categoryArray.some(category =>
        category && group.beverageCategories.includes(category)
      )

      if (!hasMatchingCategory) {
        return false
      }
    }

    // Check beverage format if specified
    if (group.beverageFormat) {
      // Use the resolved Beverage Format field from Airtable instead of mapping
      const resolvedFormat = beverage.fields['Beverage Format Resolved']
      const formatArray = Array.isArray(resolvedFormat) ? resolvedFormat : (resolvedFormat ? [resolvedFormat] : [])
      const beverageFormat = formatArray.length > 0 ? formatArray[0] : null

      // Handle both string and array for group.beverageFormat
      const groupFormats = Array.isArray(group.beverageFormat) ? group.beverageFormat : [group.beverageFormat]

      if (group.title === 'Cider' || group.title === 'Wheat, Wit & Weiss' || group.title === 'Bottled' || group.title === 'Draught Beer') {
        console.log(`  - Beverage format (resolved): "${beverageFormat}", Required: ${JSON.stringify(groupFormats)}`)
        console.log(`  - Raw format field:`, beverage.fields['Beverage Format'])
        console.log(`  - Resolved format:`, resolvedFormat)
      }

      if (!beverageFormat || !groupFormats.includes(beverageFormat)) {
        // Fallback to mapped format if resolved format is not available
        const mappedFormat = getBeverageFormat(beverage)
        if (!groupFormats.includes(mappedFormat)) {
          return false
        }
      }
    }

    // Log successful matches for debugging
    if (group.title === 'Cider' || group.title === 'Wheat, Wit & Weiss' || Math.random() < 0.05) { // Always log specific groups, random for others
      console.log(`✅ Beverage "${beverageName}" matched group "${group.title}"`)
    }

    return true
  }

  // Otherwise, no beverages match
  return false
}

// Basic beverage type inference for the grouping system
function inferBeverageTypeBasic(beverage) {
  const name = beverage.fields.Name?.toLowerCase() || ''

  if (name.includes('wine') || name.includes('chardonnay') || name.includes('cabernet') ||
      name.includes('pinot') || name.includes('riesling') || name.includes('merlot') ||
      name.includes('sauvignon')) {
    return 'Wine'
  } else if (name.includes('beer') || name.includes('ale') || name.includes('lager') ||
             name.includes('ipa') || name.includes('stout') || name.includes('porter') ||
             name.includes('wheat') || name.includes('pilsner')) {
    return 'Beer'
  } else if (name.includes('cider') || name.includes('rtd') || name.includes('seltzer') ||
             name.includes('hard seltzer') || name.includes('angry orchard') || name.includes('original sin')) {
    return 'Cider & RTD'
  } else if (name.includes('cocktail') || name.includes('martini') || name.includes('mojito') ||
             name.includes('margarita')) {
    return 'Cocktails'
  }

  return 'Other'
}

// Get beverage format for the grouping system
function getBeverageFormat(beverage) {
  const format = beverage.fields['Beverage Format']
  const formatMap = {
    'recDlaYGEmS23x6gB': 'Glass',
    'recJOuYK67z0S23Gg': 'Bottle',
    'reckfsdGMlPPVFr4B': 'Glass'  // Cider draught format
  }

  // Map format ID to readable name
  const beverageFormat = format && format.length > 0 ? formatMap[format[0]] : null

  // For beer, map Glass to Draught
  if (beverageFormat === 'Glass') {
    return 'Draught'
  } else if (beverageFormat === 'Bottle') {
    return 'Bottles'
  }

  return beverageFormat
}