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
    return location.fields?.Name || 'Unknown Location'
  }

  getLocationSlug(location) {
    const name = this.formatLocationName(location)
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  isLocationActive(location) {
    // Assuming locations have an 'Active' field - adjust based on your Airtable schema
    return location.fields?.Active !== false
  }
}

export default new LocationService()