export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const locations = await fetchFromAirtable(
    config.airtableLocationsTableName
  )

  return {
    success: true,
    data: locations
  }
})
