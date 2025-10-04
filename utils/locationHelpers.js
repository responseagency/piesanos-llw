// Helper functions for working with location data

export function formatLocationName(location) {
  const locationName = location.fields?.['Location Name']?.trim() || 'Unknown Location'
  const locationArea = location.fields?.['Location Area']?.trim()

  // Concatenate location name and area for unique identification
  if (locationArea) {
    return `${locationName} - ${locationArea}`
  }

  return locationName
}

export function getLocationSlug(location) {
  const name = formatLocationName(location)
  return name.toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, '')     // Remove non-alphanumeric except dashes
    .replace(/-+/g, '-')            // Collapse multiple dashes into single dash
    .replace(/^-|-$/g, '')          // Remove leading/trailing dashes
}

export function isLocationActive(location) {
  // Assuming locations have an 'Active' field - adjust based on your Airtable schema
  return location.fields?.Active !== false
}
