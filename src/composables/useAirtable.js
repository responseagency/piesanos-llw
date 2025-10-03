import { ref } from 'vue'
import { useSSRContext } from 'vue'
import airtableService from '../services/airtable.js'

export function useAirtable() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Try to get initial state from SSR context
  if (import.meta.env.SSR) {
    try {
      const ctx = useSSRContext()
      if (ctx?.initialState?.beverages) {
        data.value = ctx.initialState.beverages
      }
    } catch (e) {
      // SSR context not available, will fetch normally
    }
  } else if (typeof window !== 'undefined' && window.__INITIAL_STATE__?.beverages) {
    // Hydrate from window initial state on client
    data.value = window.__INITIAL_STATE__.beverages
  }

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