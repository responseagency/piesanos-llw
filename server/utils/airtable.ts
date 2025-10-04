import type { H3Event } from 'h3'

interface AirtableRecord {
  id: string
  fields: Record<string, any>
  createdTime?: string
}

export async function fetchFromAirtable(
  tableName: string,
  viewId?: string
): Promise<AirtableRecord[]> {
  const config = useRuntimeConfig()
  const token = config.airtableToken
  const baseId = config.airtableBaseId

  if (!token || !baseId || !tableName) {
    throw createError({
      statusCode: 500,
      message: 'Airtable configuration missing'
    })
  }

  let allRecords: AirtableRecord[] = []
  let offset: string | undefined = undefined
  const baseUrl = viewId
    ? `https://api.airtable.com/v0/${baseId}/${tableName}?view=${viewId}`
    : `https://api.airtable.com/v0/${baseId}/${tableName}`

  do {
    const url = offset ? `${baseUrl}&offset=${offset}` : baseUrl

    const response = await $fetch<{
      records: AirtableRecord[]
      offset?: string
    }>(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    allRecords = allRecords.concat(response.records)
    offset = response.offset
  } while (offset)

  return allRecords
}

// Lookup table configurations
export const LOOKUP_TABLES = {
  types: {
    tableName: 'Beverage Types',
    viewId: 'viwRUhZWOK8sw7BNA'
  },
  categories: {
    tableName: 'Beverage Categories',
    viewId: 'viwpmfw9XBl1T1TaD'
  }
} as const
