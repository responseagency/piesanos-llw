import 'dotenv/config'
import express from 'express'
import fs from 'fs'
import path from 'path'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3002

const CACHE_FILE_PATH = './src/data/airtable-cache.json'
const LOCATIONS_CACHE_FILE_PATH = './src/data/locations-cache.json'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

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

  const response = await fetch(baseUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Airtable API error: ${response.status} ${response.statusText}`)
  }

  const data = await response.json()
  return data.records
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
    const freshData = await fetchFromAirtable()
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})