import 'dotenv/config'
import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3002

const CACHE_FILE_PATH = './src/data/airtable-cache.json'
const LOCATIONS_CACHE_FILE_PATH = './src/data/locations-cache.json'
const LOOKUP_TABLES_CACHE_FILE_PATH = './src/data/lookup-tables-cache.json'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Lookup table view IDs and names for fetching specific views from Airtable
// Only include tables that we have API access to
const LOOKUP_TABLES = {
  types: {
    tableName: 'Beverage Types',
    viewId: 'viwRUhZWOK8sw7BNA'
  },
  categories: {
    tableName: 'Beverage Categories',
    viewId: 'viwpmfw9XBl1T1TaD'
  }
  // Note: formats and sizes tables are not accessible with current API key
  // These will be handled with fallback mappings
}

app.use(cors())
app.use(express.json())

async function fetchFromAirtable(tableName = null) {
  const token = process.env.VITE_AIRTABLE_TOKEN
  const baseId = process.env.VITE_AIRTABLE_BASE_ID
  const defaultTableName = process.env.VITE_AIRTABLE_TABLE_NAME

  const targetTable = tableName || defaultTableName

  if (!token || !baseId || !targetTable) {
    throw new Error('Airtable configuration missing. Please check your environment variables.')
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${targetTable}`
  let allRecords = []
  let offset = null

  do {
    const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl

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

async function fetchFromAirtableView(tableName, viewId) {
  const token = process.env.VITE_AIRTABLE_TOKEN
  const baseId = process.env.VITE_AIRTABLE_BASE_ID

  if (!token || !baseId || !tableName || !viewId) {
    throw new Error('Airtable configuration missing for view fetch. Please check your parameters.')
  }

  const baseUrl = `https://api.airtable.com/v0/${baseId}/${tableName}?view=${viewId}`
  let allRecords = []
  let offset = null

  do {
    const url = offset ? `${baseUrl}&offset=${offset}` : baseUrl

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Airtable API error for view ${viewId}: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    allRecords = allRecords.concat(data.records)
    offset = data.offset
  } while (offset)

  return allRecords
}

function isCacheValid(cacheFilePath = CACHE_FILE_PATH) {
  try {
    if (!fs.existsSync(cacheFilePath)) {
      return false
    }

    const stats = fs.statSync(cacheFilePath)
    const fileAge = Date.now() - stats.mtime.getTime()
    return fileAge < CACHE_DURATION
  } catch (error) {
    console.error('Error checking cache validity:', error)
    return false
  }
}

function loadFromCache(cacheFilePath = CACHE_FILE_PATH) {
  try {
    if (!fs.existsSync(cacheFilePath)) {
      return null
    }

    const data = fs.readFileSync(cacheFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading from cache:', error)
    return null
  }
}

function saveToCache(data, cacheFilePath = CACHE_FILE_PATH) {
  try {
    const dir = path.dirname(cacheFilePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const cacheData = {
      timestamp: Date.now(),
      data: data
    }

    fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData, null, 2))
    console.log(`Data cached successfully to ${cacheFilePath}`)
  } catch (error) {
    console.error('Error saving to cache:', error)
  }
}

async function getAirtableData() {
  if (isCacheValid()) {
    console.log('Loading beverage data from file cache...')
    const cachedData = loadFromCache()
    if (cachedData && cachedData.data) {
      return cachedData.data
    }
  }

  console.log('Fetching fresh beverage data from Airtable...')
  try {
    const tableName = process.env.VITE_AIRTABLE_TABLE_NAME
    const viewId = process.env.VITE_AIRTABLE_VIEW_ID

    let freshData
    if (viewId) {
      console.log(`Fetching from view ${viewId} in table ${tableName}`)
      freshData = await fetchFromAirtableView(tableName, viewId)
    } else {
      console.log(`Fetching from default view in table ${tableName}`)
      freshData = await fetchFromAirtable()
    }

    saveToCache(freshData)
    return freshData
  } catch (error) {
    console.log('Fetch failed, attempting to load from file cache as fallback...')
    const cachedData = loadFromCache()
    if (cachedData && cachedData.data) {
      console.log('Using stale cache data as fallback')
      return cachedData.data
    }
    throw error
  }
}

async function getLocationData() {
  if (isCacheValid(LOCATIONS_CACHE_FILE_PATH)) {
    console.log('Loading location data from file cache...')
    const cachedData = loadFromCache(LOCATIONS_CACHE_FILE_PATH)
    if (cachedData && cachedData.data) {
      return cachedData.data
    }
  }

  console.log('Fetching fresh location data from Airtable...')
  try {
    const locationsTableName = process.env.VITE_AIRTABLE_LOCATIONS_TABLE_NAME
    const freshData = await fetchFromAirtable(locationsTableName)
    saveToCache(freshData, LOCATIONS_CACHE_FILE_PATH)
    return freshData
  } catch (error) {
    console.log('Location fetch failed, attempting to load from file cache as fallback...')
    const cachedData = loadFromCache(LOCATIONS_CACHE_FILE_PATH)
    if (cachedData && cachedData.data) {
      console.log('Using stale location cache data as fallback')
      return cachedData.data
    }
    throw error
  }
}

async function getLookupTablesData() {
  if (isCacheValid(LOOKUP_TABLES_CACHE_FILE_PATH)) {
    console.log('Loading lookup tables data from file cache...')
    const cachedData = loadFromCache(LOOKUP_TABLES_CACHE_FILE_PATH)
    if (cachedData && cachedData.data) {
      return cachedData.data
    }
  }

  console.log('Fetching fresh lookup tables data from Airtable views...')
  try {
    const lookupData = {}

    // Fetch accessible tables
    for (const [key, config] of Object.entries(LOOKUP_TABLES)) {
      try {
        console.log(`Fetching ${key} view: ${config.viewId} from table: ${config.tableName}`)
        const tableData = await fetchFromAirtableView(config.tableName, config.viewId)
        lookupData[key] = tableData
        console.log(`Successfully fetched ${tableData.length} ${key} records`)
      } catch (error) {
        console.warn(`Failed to fetch ${key} view (${config.viewId}):`, error.message)
        lookupData[key] = []
      }
    }

    // Add empty arrays for inaccessible tables
    lookupData.formats = []
    lookupData.sizes = []

    saveToCache(lookupData, LOOKUP_TABLES_CACHE_FILE_PATH)
    return lookupData
  } catch (error) {
    console.log('Lookup tables fetch failed, attempting to load from file cache as fallback...')
    const cachedData = loadFromCache(LOOKUP_TABLES_CACHE_FILE_PATH)
    if (cachedData && cachedData.data) {
      console.log('Using stale lookup tables cache data as fallback')
      return cachedData.data
    }
    throw error
  }
}

function createLookupMappings(lookupData) {
  console.log('=== createLookupMappings called with data:', JSON.stringify(lookupData, null, 2))
  const mappings = {}

  for (const [tableKey, records] of Object.entries(lookupData)) {
    console.log(`Processing table: ${tableKey}, records count: ${Array.isArray(records) ? records.length : 'not array'}`)
    mappings[tableKey] = {}

    if (Array.isArray(records)) {
      records.forEach(record => {
        if (record.id && record.fields) {
          // Try common name fields in order of preference
          const nameField = record.fields.Name ||
                           record.fields.name ||
                           record.fields.Category ||
                           record.fields.Type ||
                           record.fields.Format ||
                           record.fields.Size ||
                           record.fields.Label ||
                           record.fields.Title ||
                           Object.values(record.fields)[0] // Fallback to first field

          if (nameField) {
            mappings[tableKey][record.id] = nameField
            console.log(`Mapped ${tableKey}: ${record.id} -> ${nameField}`)
          }
        }
      })
    }
  }

  // Add fallback mappings for formats and sizes that we can't fetch from API
  // These are common IDs we've observed in the beverage data
  mappings.formats = {
    ...mappings.formats,
    'recDlaYGEmS23x6gB': 'Glass',
    'rec0aUp7LnsIyyjoi': 'Bottle',
    'reckfsdGMlPPVFr4B': 'Draught',
    'recv5Y45UNDzSYkRN': 'Cocktail Glass',
    'recbYoh1uvlrXXnI5': 'Martini Glass',
    'recJOuYK67z0S23Gg': 'Wine Bottle',
    'reccRRXPCCn3zVjwY': 'Can'
  }

  mappings.sizes = {
    ...mappings.sizes,
    'rec2ILZWjw55W3tAZ': '6 oz',
    'recYifjWPwrg16nSU': '9 oz',
    'rece3G1UbwD51gzB6': '12 oz',
    'rec1bKYdnFr2uRnpB': '16 oz',
    'recoct47whZXNVi7g': '6 oz Snifter',
    'recZpEhpUYdzhEoNO': '25.4 oz',
    'rec24sY3kGxxGpRAL': '12 oz Bottle',
    'recYUplgpKJIBUhJq': '6.3 oz Mini',
    'rec5GO73jLOI8Jv6m': '12 oz Can'
  }

  console.log('Created lookup mappings with fallbacks:', JSON.stringify(mappings, null, 2))
  return mappings
}

app.get('/api/airtable', async (req, res) => {
  try {
    const data = await getAirtableData()
    res.json({ success: true, data })
  } catch (error) {
    console.error('API Error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/locations', async (req, res) => {
  try {
    const data = await getLocationData()
    res.json({ success: true, data })
  } catch (error) {
    console.error('Locations API Error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/lookup-tables', async (req, res) => {
  try {
    const data = await getLookupTablesData()
    res.json({ success: true, data })
  } catch (error) {
    console.error('Lookup Tables API Error:', error)
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/lookup-mappings', async (req, res) => {
  try {
    console.log('=== /api/lookup-mappings endpoint called ===')
    const lookupData = await getLookupTablesData()
    console.log('=== Retrieved lookup data:', JSON.stringify(lookupData, null, 2))
    const mappings = createLookupMappings(lookupData)
    console.log('=== Final mappings result:', JSON.stringify(mappings, null, 2))
    res.json({ success: true, data: mappings })
  } catch (error) {
    console.error('Lookup Mappings API Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Enhanced airtable endpoint that includes resolved lookup fields
app.get('/api/airtable-enhanced', async (req, res) => {
  try {
    const [beverageData, lookupData] = await Promise.all([
      getAirtableData(),
      getLookupTablesData()
    ])

    const mappings = createLookupMappings(lookupData)

    // Enhance beverage data with resolved lookup fields
    const enhancedData = beverageData.map(item => {
      const enhanced = { ...item }

      if (enhanced.fields) {
        // Resolve Beverage Categories
        if (enhanced.fields['Beverage Categories (from Beverage Item)']) {
          enhanced.fields['Beverage Categories Resolved'] = enhanced.fields['Beverage Categories (from Beverage Item)']
            .map(id => mappings.categories?.[id] || id)
        }

        // Resolve Beverage Type
        if (enhanced.fields['Beverage Type']) {
          enhanced.fields['Beverage Type Resolved'] = enhanced.fields['Beverage Type']
            .map(id => mappings.types?.[id] || id)
        }

        // Resolve Beverage Format
        if (enhanced.fields['Beverage Format']) {
          enhanced.fields['Beverage Format Resolved'] = enhanced.fields['Beverage Format']
            .map(id => mappings.formats?.[id] || id)
        }

        // Resolve Available Sizes
        if (enhanced.fields['Available Sizes']) {
          enhanced.fields['Available Sizes Resolved'] = enhanced.fields['Available Sizes']
            .map(id => mappings.sizes?.[id] || id)
        }

        // Resolve Selected Size
        if (enhanced.fields['Selected Size']) {
          enhanced.fields['Selected Size Resolved'] = enhanced.fields['Selected Size']
            .map(id => mappings.sizes?.[id] || id)
        }
      }

      return enhanced
    })

    res.json({
      success: true,
      data: enhancedData,
      mappings: mappings
    })
  } catch (error) {
    console.error('Enhanced Airtable API Error:', error)
    res.status(500).json({ error: error.message })
  }
})

// Debug endpoint to force refresh all data from Airtable
app.post('/api/refresh-data', async (req, res) => {
  try {
    console.log('🔄 Force refreshing all data from Airtable...')

    // Delete cache files to force fresh fetch
    const cacheFiles = [
      CACHE_FILE_PATH,
      LOCATIONS_CACHE_FILE_PATH,
      LOOKUP_TABLES_CACHE_FILE_PATH
    ]

    cacheFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file)
        console.log(`🗑️ Deleted cache file: ${file}`)
      }
    })

    // Fetch fresh data
    const [beverageData, locationData, lookupData] = await Promise.all([
      getAirtableData(),
      getLocationData(),
      getLookupTablesData()
    ])

    console.log(`✅ Refreshed data:`)
    console.log(`  - ${beverageData.length} beverage records`)
    console.log(`  - ${locationData.length} location records`)
    console.log(`  - ${Object.keys(lookupData).reduce((sum, key) => sum + (lookupData[key]?.length || 0), 0)} lookup records`)

    res.json({
      success: true,
      message: 'Data refreshed successfully',
      stats: {
        beverages: beverageData.length,
        locations: locationData.length,
        lookupRecords: Object.keys(lookupData).reduce((sum, key) => sum + (lookupData[key]?.length || 0), 0)
      }
    })
  } catch (error) {
    console.error('❌ Error refreshing data:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})