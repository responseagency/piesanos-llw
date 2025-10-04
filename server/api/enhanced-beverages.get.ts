export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Set cache headers
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')

  // Parallel fetch of beverages and lookup tables
  const [beverages, lookupTypes, lookupCategories] = await Promise.all([
    fetchFromAirtable(config.airtableTableName, config.airtableViewId),
    fetchFromAirtable(
      LOOKUP_TABLES.types.tableName,
      LOOKUP_TABLES.types.viewId
    ),
    fetchFromAirtable(
      LOOKUP_TABLES.categories.tableName,
      LOOKUP_TABLES.categories.viewId
    )
  ])

  const lookupData = {
    types: lookupTypes,
    categories: lookupCategories,
    formats: [],
    sizes: []
  }

  const mappings = createLookupMappings(lookupData)
  const enhancedBeverages = enhanceBeverageData(beverages, mappings)

  return {
    success: true,
    data: enhancedBeverages,
    mappings
  }
})
