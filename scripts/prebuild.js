import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function fetchFromAirtable(tableName, viewId = null) {
  const token = process.env.VITE_AIRTABLE_TOKEN
  const baseId = process.env.VITE_AIRTABLE_BASE_ID

  if (!token || !baseId || !tableName) {
    throw new Error('Missing Airtable configuration. Check your environment variables.')
  }

  let allRecords = []
  let offset = null
  const baseUrl = viewId
    ? `https://api.airtable.com/v0/${baseId}/${tableName}?view=${viewId}`
    : `https://api.airtable.com/v0/${baseId}/${tableName}`

  do {
    const url = offset ? `${baseUrl}&offset=${offset}` : baseUrl
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    allRecords = allRecords.concat(data.records)
    offset = data.offset
  } while (offset)

  return allRecords
}

async function prebuild() {
  console.log('🔄 Pre-build: Fetching fresh data from Airtable...')

  try {
    // Fetch beverage data
    const tableName = process.env.VITE_AIRTABLE_TABLE_NAME
    const viewId = process.env.VITE_AIRTABLE_VIEW_ID

    console.log(`  📦 Fetching beverages from table: ${tableName}${viewId ? ` (view: ${viewId})` : ''}`)
    const beverageData = await fetchFromAirtable(tableName, viewId)

    // Fetch location data
    const locationsTableName = process.env.VITE_AIRTABLE_LOCATIONS_TABLE_NAME
    console.log(`  📍 Fetching locations from table: ${locationsTableName}`)
    const locationData = await fetchFromAirtable(locationsTableName)

    // Fetch lookup tables data
    const lookupTables = {
      types: {
        tableName: 'Beverage Types',
        viewId: 'viwRUhZWOK8sw7BNA'
      },
      categories: {
        tableName: 'Beverage Categories',
        viewId: 'viwpmfw9XBl1T1TaD'
      }
    }

    const lookupData = {}
    for (const [key, config] of Object.entries(lookupTables)) {
      try {
        console.log(`  🔍 Fetching ${key} lookup table...`)
        const tableData = await fetchFromAirtable(config.tableName, config.viewId)
        lookupData[key] = tableData
        console.log(`    ✓ Got ${tableData.length} ${key} records`)
      } catch (error) {
        console.warn(`    ⚠ Failed to fetch ${key}: ${error.message}`)
        lookupData[key] = []
      }
    }

    // Add empty arrays for inaccessible tables
    lookupData.formats = []
    lookupData.sizes = []

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '../src/data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    // Save to cache files
    const timestamp = Date.now()

    fs.writeFileSync(
      path.join(dataDir, 'airtable-cache.json'),
      JSON.stringify({ timestamp, data: beverageData }, null, 2)
    )

    fs.writeFileSync(
      path.join(dataDir, 'locations-cache.json'),
      JSON.stringify({ timestamp, data: locationData }, null, 2)
    )

    fs.writeFileSync(
      path.join(dataDir, 'lookup-tables-cache.json'),
      JSON.stringify({ timestamp, data: lookupData }, null, 2)
    )

    console.log(`\n✅ Pre-build complete!`)
    console.log(`  📊 ${beverageData.length} beverages`)
    console.log(`  📍 ${locationData.length} locations`)
    console.log(`  🔍 ${Object.keys(lookupData).reduce((sum, key) => sum + (lookupData[key]?.length || 0), 0)} lookup records`)
    console.log(`  ⏰ Cached at: ${new Date(timestamp).toLocaleString()}`)
  } catch (error) {
    console.error('❌ Pre-build failed:', error)
    process.exit(1)
  }
}

prebuild()
