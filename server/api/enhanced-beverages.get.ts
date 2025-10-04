export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Set cache headers
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  // Parallel fetch of beverages, lookup tables, and locations
  const [beverages, lookupTypes, lookupCategories, locations] = await Promise.all([
    fetchFromAirtable(config.airtableTableName, config.airtableViewId),
    fetchFromAirtable(
      LOOKUP_TABLES.types.tableName,
      LOOKUP_TABLES.types.viewId
    ),
    fetchFromAirtable(
      LOOKUP_TABLES.categories.tableName,
      LOOKUP_TABLES.categories.viewId
    ),
    fetchFromAirtable(config.airtableLocationsTableName)
  ])

  const lookupData = {
    types: lookupTypes,
    categories: lookupCategories,
    formats: [],
    sizes: []
  }

  const mappings = createLookupMappings(lookupData)
  let enhancedBeverages = enhanceBeverageData(beverages, mappings)

  // Add location IDs to beverages based on location's "Beverage Menu Items" field
  // Create a reverse lookup: beverage ID -> location IDs
  const beverageToLocations = new Map<string, string[]>()

  for (const location of locations) {
    const menuItems = location.fields?.['Beverage Menu Items'] || []
    for (const beverageId of menuItems) {
      if (!beverageToLocations.has(beverageId)) {
        beverageToLocations.set(beverageId, [])
      }
      beverageToLocations.get(beverageId)!.push(location.id)
    }
  }

  // Add Locations field to each beverage
  enhancedBeverages = enhancedBeverages.map(beverage => ({
    ...beverage,
    fields: {
      ...beverage.fields,
      Locations: beverageToLocations.get(beverage.id) || []
    }
  }))

  return {
    success: true,
    data: enhancedBeverages,
    mappings
  }
})
