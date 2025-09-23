import { ref } from 'vue'
import airtableService from '../services/airtable.js'

export function useAirtable() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const result = await airtableService.getData()
      data.value = result
    } catch (err) {
      error.value = err.message || 'Failed to fetch data'
      console.error('Error in useAirtable:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    fetchData
  }
}