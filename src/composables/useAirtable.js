import { ref, inject } from 'vue'
import airtableService from '../services/airtable.js'

export function useAirtable() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Try to get initial state from Vue provide/inject
  const initialState = inject('initialState', null)

  if (import.meta.env.SSR) {
    // During SSR, use data from initialState
    if (initialState?.beverages) {
      data.value = initialState.beverages
      console.log('[useAirtable SSR] Using data from initialState, beverages count:', data.value?.length)
    }
  } else if (typeof window !== 'undefined' && window.__INITIAL_STATE__?.beverages) {
    // Hydrate from window initial state on client
    data.value = window.__INITIAL_STATE__.beverages
    console.log('[useAirtable] Hydrated from window.__INITIAL_STATE__, beverages count:', data.value?.length)
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