import { ref, computed, inject } from 'vue'

/**
 * Composable for fetching and managing lookup mappings from the server
 * Provides category, type, format, and size mappings from Airtable
 */
export function useLookupMappings() {
  // Fallback mappings for formats and sizes (not accessible via API)
  const FALLBACK_FORMAT_MAPPINGS = {
    'recDlaYGEmS23x6gB': 'Draught',
    'recJOuYK67z0S23Gg': 'Bottle',
    'reckfsdGMlPPVFr4B': 'Draught',  // Cider draught format
    'recW9YJwXQBGdVx6b': 'Can'
  }

  const FALLBACK_SIZE_MAPPINGS = {
    // Add size mappings as needed
  }

  // Try to get initial state from Vue provide/inject
  const initialState = inject('initialState', null)

  // Initialize mappings from SSG/SSR initialState if available
  const initialMappings = (import.meta.env.SSR && initialState?.lookupMappings) ||
    (typeof window !== 'undefined' && window.__INITIAL_STATE__?.lookupMappings) ||
    null

  const mappings = ref(initialMappings || {
    categories: {},
    types: {},
    formats: FALLBACK_FORMAT_MAPPINGS,
    sizes: FALLBACK_SIZE_MAPPINGS
  })

  if (initialMappings) {
    console.log('[useLookupMappings] Using pre-built mappings from initialState')
  }

  const isLoading = ref(false)
  const error = ref(null)

  /**
   * Fetch lookup mappings from the server
   */
  async function fetchMappings() {
    if (isLoading.value) return // Prevent concurrent requests

    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`http://localhost:3002/api/lookup-mappings`)

      if (!response.ok) {
        throw new Error(`Failed to fetch lookup mappings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success && data.data) {
        // Merge fetched mappings with fallback format/size mappings
        mappings.value = {
          categories: data.data.categories || {},
          types: data.data.types || {},
          formats: { ...FALLBACK_FORMAT_MAPPINGS, ...(data.data.formats || {}) },
          sizes: { ...FALLBACK_SIZE_MAPPINGS, ...(data.data.sizes || {}) }
        }
        console.log('Loaded lookup mappings:', mappings.value)
      } else {
        throw new Error('Invalid response format from lookup mappings API')
      }
    } catch (err) {
      console.error('Error fetching lookup mappings:', err)
      error.value = err.message

      // Fall back to only fallback mappings on error
      mappings.value = {
        categories: {},
        types: {},
        formats: FALLBACK_FORMAT_MAPPINGS,
        sizes: FALLBACK_SIZE_MAPPINGS
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get readable name for a category ID
   */
  function getCategoryName(categoryId) {
    if (!categoryId) return null
    return mappings.value.categories[categoryId] || `Category ${categoryId.slice(-6)}`
  }

  /**
   * Get readable name for a type ID
   */
  function getTypeName(typeId) {
    if (!typeId) return null
    return mappings.value.types[typeId] || `Type ${typeId.slice(-6)}`
  }

  /**
   * Get readable name for a format ID
   */
  function getFormatName(formatId) {
    if (!formatId) return null
    return mappings.value.formats[formatId] || `Format ${formatId.slice(-6)}`
  }

  /**
   * Get readable name for a size ID
   */
  function getSizeName(sizeId) {
    if (!sizeId) return null
    return mappings.value.sizes[sizeId] || `Size ${sizeId.slice(-6)}`
  }

  /**
   * Get all available categories
   */
  const categories = computed(() => mappings.value.categories)

  /**
   * Get all available types
   */
  const types = computed(() => mappings.value.types)

  /**
   * Get all available formats
   */
  const formats = computed(() => mappings.value.formats)

  /**
   * Get all available sizes
   */
  const sizes = computed(() => mappings.value.sizes)

  /**
   * Check if mappings are loaded and available
   */
  const isReady = computed(() => {
    return !isLoading.value &&
           Object.keys(mappings.value.categories).length > 0 ||
           Object.keys(mappings.value.types).length > 0
  })

  return {
    // State
    mappings,
    isLoading,
    error,
    isReady,

    // Methods
    fetchMappings,
    getCategoryName,
    getTypeName,
    getFormatName,
    getSizeName,

    // Computed
    categories,
    types,
    formats,
    sizes
  }
}