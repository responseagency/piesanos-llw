class LocationService {
  constructor() {
    const port = import.meta.env.VITE_PORT || 3002
    this.apiEndpoint = `http://localhost:${port}/api/locations`
  }

  async fetchData() {
    try {
      const response = await fetch(this.apiEndpoint)

      if (!response.ok) {
        throw new Error(`Location API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown location API error')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching location data:', error)
      throw error
    }
  }

  async getData() {
    return this.fetchData()
  }

  // Helper methods for working with location data
  formatLocationName(location) {
    const locationName = location.fields?.['Location Name']?.trim() || 'Unknown Location'
    const locationArea = location.fields?.['Location Area']?.trim()

    // Concatenate location name and area for unique identification
    if (locationArea) {
      return `${locationName} - ${locationArea}`
    }

    return locationName
  }

  getLocationSlug(location) {
    const name = this.formatLocationName(location)
    return name.toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with dashes
      .replace(/[^a-z0-9-]/g, '')     // Remove non-alphanumeric except dashes
      .replace(/-+/g, '-')            // Collapse multiple dashes into single dash
      .replace(/^-|-$/g, '')          // Remove leading/trailing dashes
  }

  isLocationActive(location) {
    // Assuming locations have an 'Active' field - adjust based on your Airtable schema
    return location.fields?.Active !== false
  }
}

export default new LocationService()