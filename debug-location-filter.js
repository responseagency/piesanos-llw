// Debug script to examine location filtering issue
import { useAirtable } from './src/composables/useAirtable.js'
import { useLocationFilter } from './src/composables/useLocationFilter.js'
import { organizeByHierarchy, filterHierarchy } from './src/utils/hierarchicalBeverageOrganizer.js'

async function debugLocationFiltering() {
  console.log('🔍 Starting location filtering debug...')

  // Load data
  const { data, fetchData } = useAirtable()
  const { locations, fetchLocations } = useLocationFilter()

  await Promise.all([fetchData(), fetchLocations()])

  if (!data.value) {
    console.error('❌ No beverage data loaded')
    return
  }

  console.log(`📊 Total beverages loaded: ${data.value.length}`)

  // Find all Cider & RTD beverages
  const ciderRTDBeverages = data.value.filter(beverage => {
    const beverageType = beverage.fields['Beverage Type']
    return beverageType && beverageType.includes('Cider & RTD')
  })

  console.log(`🍺 Found ${ciderRTDBeverages.length} Cider & RTD beverages:`)
  ciderRTDBeverages.forEach(beverage => {
    const name = beverage.fields.Name
    const format = beverage.fields['Beverage Format']
    const unavailableLocations = beverage.fields['Unavailable Locations'] || []
    console.log(`  - "${name}"`)
    console.log(`    Format: ${format}`)
    console.log(`    Unavailable at locations: ${unavailableLocations.join(', ')}`)
    console.log(`    Available at location 3: ${!unavailableLocations.includes('3')}`)
  })

  // Test hierarchical organization without filtering
  console.log('\n🏗️ Testing hierarchical organization without location filtering...')
  const organizedWithoutFilter = organizeByHierarchy(data.value)

  // Look for cider group in on-tap section
  const onTapSection = organizedWithoutFilter['on-tap']
  if (onTapSection && onTapSection.groups.cider) {
    const ciderGroup = onTapSection.groups.cider
    console.log(`📋 Cider group found with ${ciderGroup.beverages.length} beverages:`)
    ciderGroup.beverages.forEach(beverage => {
      const name = beverage.fields.Name
      const unavailableLocations = beverage.fields['Unavailable Locations'] || []
      console.log(`  - "${name}" (unavailable at: ${unavailableLocations.join(', ')})`)
    })
  } else {
    console.log('❌ No cider group found in on-tap section')
  }

  // Test hierarchical organization WITH location filtering for location 3
  console.log('\n🎯 Testing hierarchical organization WITH location 3 filtering...')
  const organizedWithFilter = filterHierarchy(organizedWithoutFilter, {
    selectedLocationId: '3'
  })

  const onTapSectionFiltered = organizedWithFilter['on-tap']
  if (onTapSectionFiltered && onTapSectionFiltered.groups.cider) {
    const ciderGroupFiltered = onTapSectionFiltered.groups.cider
    console.log(`📋 Filtered cider group found with ${ciderGroupFiltered.beverages.length} beverages:`)
    ciderGroupFiltered.beverages.forEach(beverage => {
      const name = beverage.fields.Name
      console.log(`  - "${name}"`)
    })
  } else {
    console.log('❌ No cider group found in filtered on-tap section')
    console.log('Available sections after filtering:', Object.keys(organizedWithFilter))
    if (organizedWithFilter['on-tap']) {
      console.log('Available groups in on-tap:', Object.keys(organizedWithFilter['on-tap'].groups))
    }
  }

  // Check if any beverages should be available at location 3
  const shouldBeAvailableAtLocation3 = ciderRTDBeverages.filter(beverage => {
    const unavailableLocations = beverage.fields['Unavailable Locations'] || []
    return !unavailableLocations.includes('3')
  })

  console.log(`\n✅ Beverages that should be available at location 3: ${shouldBeAvailableAtLocation3.length}`)
  shouldBeAvailableAtLocation3.forEach(beverage => {
    console.log(`  - "${beverage.fields.Name}"`)
  })
}

// Run the debug function
debugLocationFiltering().catch(console.error)