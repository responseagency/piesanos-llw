class AirtableService {
  constructor() {
    const port = import.meta.env.VITE_PORT || 3002
    this.apiEndpoint = `http://localhost:${port}/api/airtable-enhanced`
  }

  async fetchData() {
    try {
      const response = await fetch(this.apiEndpoint)

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown API error')
      }

      return result.data
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error
    }
  }

  async getData() {
    return this.fetchData()
  }
}

export default new AirtableService()