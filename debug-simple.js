// Simple debug to examine beverage data structure
// This script needs to be run from the browser console or with proper module loading

console.log('=== DEBUGGING LOCATION FILTERING FOR CIDER & RTD ===')

// Mock some beverages that match the described issue
const mockBeverages = [
  {
    id: 'rec1',
    fields: {
      'Name': 'Test Cider - Draught 16 oz Glass',
      'Beverage Type': ['Cider & RTD'],
      'Beverage Format': ['recDlaYGEmS23x6gB'], // Glass format ID
      'Unavailable Locations': [], // Available at all locations
      'Price': 8
    }
  },
  {
    id: 'rec2',
    fields: {
      'Name': 'Test RTD - Draught 16 oz Glass',
      'Beverage Type': ['Cider & RTD'],
      'Beverage Format': ['recDlaYGEmS23x6gB'], // Glass format ID
      'Unavailable Locations': ['1', '2'], // Not available at locations 1,2 but should be at 3
      'Price': 9
    }
  },
  {
    id: 'rec3',
    fields: {
      'Name': 'Test RTD - Bottle',
      'Beverage Type': ['Cider & RTD'],
      'Beverage Format': ['recJOuYK67z0S23Gg'], // Bottle format ID
      'Unavailable Locations': ['3'], // Not available at location 3
      'Price': 7
    }
  }
]

// Test the grouping logic
function testGroupingLogic() {
  console.log('\n1. Testing beverage type inference:')

  mockBeverages.forEach(beverage => {
    const name = beverage.fields.Name
    const beverageType = beverage.fields['Beverage Type']
    console.log(`  - "${name}": ${beverageType ? beverageType[0] : 'No type'}`)
  })

  console.log('\n2. Testing format mapping:')

  mockBeverages.forEach(beverage => {
    const name = beverage.fields.Name
    const format = beverage.fields['Beverage Format']
    const formatMap = {
      'recDlaYGEmS23x6gB': 'Glass',
      'recJOuYK67z0S23Gg': 'Bottle'
    }

    const beverageFormat = format && format.length > 0 ? formatMap[format[0]] : null
    const mappedFormat = beverageFormat === 'Glass' ? 'Draught' : (beverageFormat === 'Bottle' ? 'Bottles' : beverageFormat)

    console.log(`  - "${name}": ${format ? format[0] : 'No format'} -> ${mappedFormat}`)
  })

  console.log('\n3. Testing cider group matching logic:')

  // Simulate the cider group criteria
  const ciderGroupCriteria = {
    beverageType: 'Cider & RTD',
    beverageFormat: 'Draught'
  }

  mockBeverages.forEach(beverage => {
    const name = beverage.fields.Name
    const beverageType = beverage.fields['Beverage Type']
    const format = beverage.fields['Beverage Format']

    // Check beverage type
    const typeMatches = beverageType && beverageType.includes(ciderGroupCriteria.beverageType)

    // Check format
    const formatMap = {
      'recDlaYGEmS23x6gB': 'Glass',
      'recJOuYK67z0S23Gg': 'Bottle'
    }
    const beverageFormat = format && format.length > 0 ? formatMap[format[0]] : null
    const mappedFormat = beverageFormat === 'Glass' ? 'Draught' : (beverageFormat === 'Bottle' ? 'Bottles' : beverageFormat)
    const formatMatches = mappedFormat === ciderGroupCriteria.beverageFormat

    const shouldMatch = typeMatches && formatMatches

    console.log(`  - "${name}": Type match: ${typeMatches}, Format match: ${formatMatches} -> Should be in cider group: ${shouldMatch}`)
  })

  console.log('\n4. Testing location filtering for location 3:')

  mockBeverages.forEach(beverage => {
    const name = beverage.fields.Name
    const unavailableLocations = beverage.fields['Unavailable Locations'] || []
    const availableAtLocation3 = !unavailableLocations.includes('3')

    console.log(`  - "${name}": Unavailable at: [${unavailableLocations.join(', ')}] -> Available at location 3: ${availableAtLocation3}`)
  })

  console.log('\n5. Combined test - should appear in cider group at location 3:')

  const ciderBeveragesAtLocation3 = mockBeverages.filter(beverage => {
    // Must match cider group criteria
    const beverageType = beverage.fields['Beverage Type']
    const typeMatches = beverageType && beverageType.includes('Cider & RTD')

    const format = beverage.fields['Beverage Format']
    const formatMap = {
      'recDlaYGEmS23x6gB': 'Glass',
      'recJOuYK67z0S23Gg': 'Bottle'
    }
    const beverageFormat = format && format.length > 0 ? formatMap[format[0]] : null
    const mappedFormat = beverageFormat === 'Glass' ? 'Draught' : (beverageFormat === 'Bottle' ? 'Bottles' : beverageFormat)
    const formatMatches = mappedFormat === 'Draught'

    // Must be available at location 3
    const unavailableLocations = beverage.fields['Unavailable Locations'] || []
    const availableAtLocation3 = !unavailableLocations.includes('3')

    return typeMatches && formatMatches && availableAtLocation3
  })

  console.log(`  Found ${ciderBeveragesAtLocation3.length} beverages that should appear:`)
  ciderBeveragesAtLocation3.forEach(beverage => {
    console.log(`    - "${beverage.fields.Name}"`)
  })
}

testGroupingLogic()