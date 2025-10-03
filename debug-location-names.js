import locationService from './src/services/location.js'
import locationsData from './src/data/locations-cache.json' with { type: 'json' }

console.log('Testing location name formatting...\n')

// Test the locations to see how names are formatted
locationsData.data.forEach(location => {
  const formattedName = locationService.formatLocationName(location)
  const slug = locationService.getLocationSlug(location)
  const locationNumber = location.fields['Location Number']

  console.log(`Location #${locationNumber}: "${formattedName}" -> slug: "${slug}"`)
})

// Check for duplicate location names
console.log('\n--- Checking for duplicate location names ---')
const nameCount = {}
locationsData.data.forEach(location => {
  const originalName = location.fields['Location Name']?.trim()
  nameCount[originalName] = (nameCount[originalName] || 0) + 1
})

console.log('\nLocations with duplicate names:')
Object.entries(nameCount).forEach(([name, count]) => {
  if (count > 1) {
    console.log(`"${name}": ${count} locations`)
  }
})

// Show how those duplicates are now unique
console.log('\nUnique formatted names for duplicate locations:')
Object.entries(nameCount).forEach(([name, count]) => {
  if (count > 1) {
    console.log(`\nDuplicate "${name}" locations:`)
    locationsData.data
      .filter(loc => loc.fields['Location Name']?.trim() === name)
      .forEach(loc => {
        const formattedName = locationService.formatLocationName(loc)
        const locationNumber = loc.fields['Location Number']
        console.log(`  - Location #${locationNumber}: "${formattedName}"`)
      })
  }
})