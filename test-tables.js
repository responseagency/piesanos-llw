import 'dotenv/config'

const token = process.env.VITE_AIRTABLE_TOKEN
const baseId = process.env.VITE_AIRTABLE_BASE_ID

// Test different table names without view IDs
const TABLE_NAMES = [
  'Beverage Categories',
  'Beverage Types',
  'Beverage Formats',
  'Available Sizes',
  'Drink Formats',
  'Drink Sizes',
  'Formats',
  'Sizes'
]

async function testTable(tableName) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`
    console.log(`Testing table: ${tableName}`)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      console.log(`✅ SUCCESS for ${tableName}:`, data.records?.length || 0, 'records')
      if (data.records && data.records.length > 0) {
        console.log('   First record fields:', Object.keys(data.records[0].fields || {}))
      }
      return { success: true, data }
    } else {
      console.log(`❌ FAILED for ${tableName}: ${response.status} ${response.statusText}`)
      return { success: false, error: `${response.status} ${response.statusText}` }
    }
  } catch (error) {
    console.log(`❌ ERROR for ${tableName}:`, error.message)
    return { success: false, error: error.message }
  }
}

async function runTests() {
  console.log('Testing all table names...\n')

  for (const tableName of TABLE_NAMES) {
    await testTable(tableName)
    console.log('')
  }
}

runTests()