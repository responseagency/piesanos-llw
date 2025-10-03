// Hierarchical beverage organizer using the new grouping system
import { DRINK_GROUPINGS, getSections, getGroupsForSection, beverageBelongsToGroup, shouldShowGroupAtLocation } from '../config/drinkGroupings.js'
import { inferBeverageType, categorizeWine, categorizeBeer } from './beverageOrganizer.js'

// Enhanced beverage type inference for hierarchical grouping
function inferBeverageTypeForGrouping(beverage) {
  const name = beverage.fields.Name?.toLowerCase() || ''

  // Handle samplers specifically
  if (name.includes('sampler') || name.includes('you pick') || name.includes('manager')) {
    return 'Sampler'
  }

  // Use existing logic but add more specific categorization
  const baseType = inferBeverageType(beverage)

  if (baseType === 'Wine') {
    const wineSubcategory = categorizeWine(beverage)
    return `Wine - ${wineSubcategory}`
  } else if (baseType === 'Beer') {
    const beerSubcategory = categorizeBeer(beverage)
    return `Beer - ${beerSubcategory}`
  } else if (baseType === 'Cider') {
    return 'Cider'
  } else if (baseType === 'Cocktails') {
    return 'Cocktails'
  } else if (baseType === 'Hard Seltzer') {
    return 'Hard Seltzer'
  }

  return baseType
}

// This function is now imported from the config file
// The logic has been moved to drinkGroupings.js for better organization

// Organize beverages into hierarchical structure
export function organizeByHierarchy(beverages, locationNumber = null) {
  const sections = getSections()
  const organized = {}

  if (locationNumber) {
    console.log(`🏪 Organizing hierarchy for location number: ${locationNumber}`)
  }

  // Debug: Log the total number of beverages and sample some names
  console.log(`🔍 Processing ${beverages.length} beverages for hierarchical organization`)

  // Look for potential cider/seltzer beverages
  const potentialCiders = beverages.filter(b => {
    const name = (b.fields.Name || '').toLowerCase()
    return name.includes('cider') || name.includes('seltzer') || name.includes('rtd') || name.includes('hard')
  })

  if (potentialCiders.length > 0) {
    console.log(`🍺 Found ${potentialCiders.length} potential cider/seltzer beverages:`)
    potentialCiders.forEach(b => {
      const category = b.fields['Beverage Categories (from Beverage Item)']
      const format = b.fields['Beverage Format']
      console.log(`  - "${b.fields.Name}"`)
      console.log(`    Category: "${category}", Format: ${JSON.stringify(format)}`)
    })
  } else {
    console.log(`⚠️ No beverages found with 'cider', 'seltzer', 'rtd', or 'hard' in the name`)
  }

  // Also check what unique beverage categories exist
  const uniqueCategories = [...new Set(beverages.map(b => b.fields['Beverage Categories (from Beverage Item)']).filter(Boolean))]
  console.log(`📋 All unique beverage categories in data:`, uniqueCategories)

  // Check what unique beverage formats exist
  const uniqueFormats = [...new Set(beverages.map(b => b.fields['Beverage Format']).flat().filter(Boolean))]
  console.log(`📋 All unique beverage format IDs:`, uniqueFormats)

  // Initialize structure
  sections.forEach(section => {
    organized[section.id] = {
      ...section,
      groups: {}
    }

    const groups = getGroupsForSection(section.id)
    groups.forEach(group => {
      // Only initialize groups that should be shown at this location
      if (shouldShowGroupAtLocation(group, locationNumber)) {
        organized[section.id].groups[group.id] = {
          ...group,
          beverages: []
        }
      } else if (locationNumber) {
        console.log(`🚫 Skipping group "${group.title}" - not available at location ${locationNumber}`)
      }
    })
  })

  // Organize beverages into groups
  beverages.forEach(beverage => {
    sections.forEach(section => {
      const groups = getGroupsForSection(section.id)

      groups.forEach(group => {
        // Check if group exists in organized structure (it may have been filtered out by location)
        if (organized[section.id].groups[group.id] && beverageBelongsToGroup(beverage, group)) {
          organized[section.id].groups[group.id].beverages.push(beverage)
        }
      })
    })
  })

  // Sort beverages within each group by name
  sections.forEach(section => {
    const groups = getGroupsForSection(section.id)

    groups.forEach(group => {
      // Check if group exists in organized structure (it may have been filtered out by location)
      if (organized[section.id].groups[group.id] && organized[section.id].groups[group.id].beverages) {
        organized[section.id].groups[group.id].beverages.sort((a, b) =>
          (a.fields.Name || '').localeCompare(b.fields.Name || '')
        )
      }
    })
  })

  // Debug: Log the results before cleaning
  console.log(`📊 Group results before cleaning:`)
  sections.forEach(section => {
    const sectionData = organized[section.id]
    console.log(`  Section: ${section.title}`)

    Object.keys(sectionData.groups).forEach(groupId => {
      const group = sectionData.groups[groupId]
      const beverageCount = group.beverages ? group.beverages.length : 0
      console.log(`    Group: ${group.title} - ${beverageCount} beverages ${group.isCustomGroup ? '(custom)' : ''}`)

      if (group.title === 'Cider') {
        console.log(`    🍺 Cider group details:`)
        console.log(`      - Beverage count: ${beverageCount}`)
        console.log(`      - Expected beverageCategories: ${JSON.stringify(group.beverageCategories)}`)
        console.log(`      - Expected beverageFormat: "${group.beverageFormat}"`)

        if (beverageCount > 0) {
          console.log(`      - Sample beverage in group:`, group.beverages[0].fields)
        } else {
          console.log(`      ⚠️ No beverages matched the cider group criteria`)
        }
      }
    })
  })

  // Remove empty groups and sections
  const cleaned = {}
  sections.forEach(section => {
    const sectionData = organized[section.id]
    const groupsWithBeverages = {}

    Object.keys(sectionData.groups).forEach(groupId => {
      const group = sectionData.groups[groupId]
      // Keep custom groups even if they don't have beverages
      // Keep regular groups only if they have beverages
      if (group.isCustomGroup || (group.beverages && group.beverages.length > 0)) {
        groupsWithBeverages[groupId] = group
      } else if (group.title === 'Cider') {
        console.log(`🚫 Removing empty Cider group from section "${section.title}"`)
      }
    })

    // Only include section if it has groups with beverages
    if (Object.keys(groupsWithBeverages).length > 0) {
      cleaned[section.id] = {
        ...sectionData,
        groups: groupsWithBeverages
      }
    }
  })

  console.log(`📊 Final cleaned structure:`, Object.keys(cleaned).map(sectionId => {
    const section = cleaned[sectionId]
    return {
      section: section.title,
      groups: Object.keys(section.groups).map(groupId => ({
        group: section.groups[groupId].title,
        count: section.groups[groupId].beverages?.length || 0
      }))
    }
  }))

  return cleaned
}

// Apply location filtering to hierarchical structure
export function filterHierarchyByLocation(hierarchicalBeverages, selectedLocationId, locationNumber = null) {
  if (!selectedLocationId) return hierarchicalBeverages

  if (process.env.NODE_ENV === 'development') {
    console.log(`🏪 Applying beverage-level location filter for location ID: ${selectedLocationId}`)
  }

  const filtered = {}
  let totalBeveragesBeforeFilter = 0
  let totalBeveragesAfterFilter = 0

  Object.keys(hierarchicalBeverages).forEach(sectionId => {
    const section = hierarchicalBeverages[sectionId]
    const filteredGroups = {}

    Object.keys(section.groups).forEach(groupId => {
      const group = section.groups[groupId]

      // Keep custom groups regardless of location filtering
      if (group.isCustomGroup) {
        filteredGroups[groupId] = group
        return
      }

      const originalCount = group.beverages.length
      totalBeveragesBeforeFilter += originalCount

      const filteredBeverages = group.beverages.filter(beverage => {
        const unavailableLocations = beverage.fields['Unavailable Locations'] || []
        const isAvailable = !unavailableLocations.includes(selectedLocationId)

        if (process.env.NODE_ENV === 'development' && !isAvailable) {
          console.log(`  ❌ Filtering out "${beverage.fields.Name}" - unavailable at location ${selectedLocationId}`)
        }

        return isAvailable
      })

      const filteredCount = filteredBeverages.length
      totalBeveragesAfterFilter += filteredCount

      if (process.env.NODE_ENV === 'development' && originalCount > 0) {
        console.log(`  📊 Group "${group.title}": ${originalCount} → ${filteredCount} beverages`)
      }

      if (filteredBeverages.length > 0) {
        filteredGroups[groupId] = {
          ...group,
          beverages: filteredBeverages
        }
      }
    })

    if (Object.keys(filteredGroups).length > 0) {
      filtered[sectionId] = {
        ...section,
        groups: filteredGroups
      }
    }
  })

  if (process.env.NODE_ENV === 'development') {
    console.log(`🏪 Location filtering complete: ${totalBeveragesBeforeFilter} → ${totalBeveragesAfterFilter} beverages`)
  }

  return filtered
}

// Apply availability filtering to hierarchical structure
export function filterHierarchyByAvailability(hierarchicalBeverages, showOnlyAvailable = false) {
  if (!showOnlyAvailable) return hierarchicalBeverages

  const filtered = {}

  Object.keys(hierarchicalBeverages).forEach(sectionId => {
    const section = hierarchicalBeverages[sectionId]
    const filteredGroups = {}

    Object.keys(section.groups).forEach(groupId => {
      const group = section.groups[groupId]

      // Keep custom groups regardless of availability filtering
      if (group.isCustomGroup) {
        filteredGroups[groupId] = group
        return
      }

      const filteredBeverages = group.beverages.filter(beverage =>
        beverage.fields['Is valid size?'] === '✅ Valid'
      )

      if (filteredBeverages.length > 0) {
        filteredGroups[groupId] = {
          ...group,
          beverages: filteredBeverages
        }
      }
    })

    if (Object.keys(filteredGroups).length > 0) {
      filtered[sectionId] = {
        ...section,
        groups: filteredGroups
      }
    }
  })

  return filtered
}

// Combined filter function for hierarchical data
export function filterHierarchy(hierarchicalBeverages, options = {}) {
  const {
    showOnlyAvailable = false,
    selectedLocationId = null,
    locationNumber = null,
    customFilter = null
  } = options

  let filtered = { ...hierarchicalBeverages }

  // Apply location filter
  if (selectedLocationId) {
    filtered = filterHierarchyByLocation(filtered, selectedLocationId, locationNumber)
  }

  // Apply availability filter
  if (showOnlyAvailable) {
    filtered = filterHierarchyByAvailability(filtered, showOnlyAvailable)
  }

  // Apply custom filter if provided
  if (customFilter && typeof customFilter === 'function') {
    const customFiltered = {}

    Object.keys(filtered).forEach(sectionId => {
      const section = filtered[sectionId]
      const filteredGroups = {}

      Object.keys(section.groups).forEach(groupId => {
        const group = section.groups[groupId]

        // Keep custom groups regardless of custom filtering
        if (group.isCustomGroup) {
          filteredGroups[groupId] = group
          return
        }

        const filteredBeverages = group.beverages.filter(customFilter)

        if (filteredBeverages.length > 0) {
          filteredGroups[groupId] = {
            ...group,
            beverages: filteredBeverages
          }
        }
      })

      if (Object.keys(filteredGroups).length > 0) {
        customFiltered[sectionId] = {
          ...section,
          groups: filteredGroups
        }
      }
    })

    filtered = customFiltered
  }

  return filtered
}

// Sort beverages within hierarchy by price
export function sortHierarchyByPrice(hierarchicalBeverages, ascending = true) {
  const sorted = {}

  Object.keys(hierarchicalBeverages).forEach(sectionId => {
    const section = hierarchicalBeverages[sectionId]
    const sortedGroups = {}

    Object.keys(section.groups).forEach(groupId => {
      const group = section.groups[groupId]
      const sortedBeverages = [...group.beverages].sort((a, b) => {
        const priceA = a.fields.Price || 0
        const priceB = b.fields.Price || 0
        return ascending ? priceA - priceB : priceB - priceA
      })

      sortedGroups[groupId] = {
        ...group,
        beverages: sortedBeverages
      }
    })

    sorted[sectionId] = {
      ...section,
      groups: sortedGroups
    }
  })

  return sorted
}

// Get stats for hierarchical data
export function getHierarchyStats(hierarchicalBeverages) {
  const stats = {}

  Object.keys(hierarchicalBeverages).forEach(sectionId => {
    const section = hierarchicalBeverages[sectionId]
    stats[sectionId] = {
      title: section.title,
      groupCount: Object.keys(section.groups).length,
      groups: {}
    }

    Object.keys(section.groups).forEach(groupId => {
      const group = section.groups[groupId]
      const beverages = group.beverages || []
      const prices = beverages.map(b => b.fields.Price || 0).filter(p => p > 0)

      stats[sectionId].groups[groupId] = {
        title: group.title,
        count: beverages.length,
        avgPrice: prices.length > 0 ? (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2) : 0,
        minPrice: prices.length > 0 ? Math.min(...prices) : 0,
        maxPrice: prices.length > 0 ? Math.max(...prices) : 0
      }
    })
  })

  return stats
}