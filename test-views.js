import 'dotenv/config'

const token = process.env.VITE_AIRTABLE_TOKEN
const baseId = process.env.VITE_AIRTABLE_BASE_ID

// Test different combinations of table names and view IDs
const POTENTIAL_TABLE_NAMES = [
  'Beverage Categories',
  'Beverage Types',
  'Beverage Formats',
  'Available Sizes',
  'tblBeverageCategories',
  'tblBeverageTypes',
  'tblBeverageFormats',
  'tblAvailableSizes'
]

const VIEW_IDS = {
  formats: 'viwoIdxicAfFYOywD',
  types: 'viwRUhZWOK8sw7BNA',
  categories: 'viwpmfw9XBl1T1TaD',
  sizes: 'viwCPIT6EbTJHAwZ1'
}

async function testTableAndView(tableName, viewId, description) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?view=${viewId}`
    console.log(`Testing ${description}: ${url}`)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ SUCCESS for ${description}:`, data.records?.length || 0, 'records')
      if (data.records && data.records.length > 0) {
        console.log('   Sample record:', JSON.stringify(data.records[0], null, 2))
      }
      return { success: true, data }
    } else {
      console.log(`❌ FAILED for ${description}: ${response.status} ${response.statusText}`)
      return { success: false, error: `${response.status} ${response.statusText}` }
    }
  } catch (error) {
    console.log(`❌ ERROR for ${description}:`, error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('Testing all table name and view ID combinations...\n')

  for (const [viewKey, viewId] of Object.entries(VIEW_IDS)) {
    console.log(`\n--- Testing ${viewKey} (${viewId}) ---`)

    for (const tableName of POTENTIAL_TABLE_NAMES) {
      await testTableAndView(tableName, viewId, `${viewKey} with table ${tableName}`)
    }
  }
}

runTests()