export interface LookupMappings {
  categories: Record<string, string>
  types: Record<string, string>
  formats: Record<string, string>
  sizes: Record<string, string>
}

export function createLookupMappings(lookupData: any): LookupMappings {
  const mappings: LookupMappings = {
    categories: {},
    types: {},
    formats: {},
    sizes: {}
  }

  // Process fetched lookup tables
  for (const [tableKey, records] of Object.entries(lookupData)) {
    if (Array.isArray(records)) {
      records.forEach((record: any) => {
        if (record.id && record.fields) {
          const nameField = record.fields.Name ||
                           record.fields.name ||
                           Object.values(record.fields)[0]

          if (nameField) {
            mappings[tableKey as keyof LookupMappings][record.id] = nameField as string
          }
        }
      })
    }
  }

  // Add fallback format mappings
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

  // Add fallback size mappings
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

  return mappings
}

export function enhanceBeverageData(beverages: any[], mappings: LookupMappings) {
  return beverages.map(item => {
    const enhanced = { ...item }

    if (enhanced.fields) {
      // Resolve categories
      if (enhanced.fields['Beverage Categories (from Beverage Item)']) {
        enhanced.fields['Beverage Categories Resolved'] =
          enhanced.fields['Beverage Categories (from Beverage Item)']
            .map((id: string) => mappings.categories?.[id] || id)
      }

      // Resolve type
      if (enhanced.fields['Beverage Type']) {
        enhanced.fields['Beverage Type Resolved'] =
          enhanced.fields['Beverage Type']
            .map((id: string) => mappings.types?.[id] || id)
      }

      // Resolve format
      if (enhanced.fields['Beverage Format']) {
        enhanced.fields['Beverage Format Resolved'] =
          enhanced.fields['Beverage Format']
            .map((id: string) => mappings.formats?.[id] || id)
      }

      // Resolve sizes
      if (enhanced.fields['Available Sizes']) {
        enhanced.fields['Available Sizes Resolved'] =
          enhanced.fields['Available Sizes']
            .map((id: string) => mappings.sizes?.[id] || id)
      }

      if (enhanced.fields['Selected Size']) {
        enhanced.fields['Selected Size Resolved'] =
          enhanced.fields['Selected Size']
            .map((id: string) => mappings.sizes?.[id] || id)
      }
    }

    return enhanced
  })
}
