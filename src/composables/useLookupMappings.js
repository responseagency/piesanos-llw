import { ref, computed } from 'vue'

/**
 * Composable for fetching and managing lookup mappings from the server
 * Provides category, type, format, and size mappings from Airtable
 */
export function useLookupMappings() {
  const mappings = ref({
    categories: {},
    types: {},
    formats: {},
    sizes: {}
  })
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
        mappings.value = data.data
        console.log('Loaded lookup mappings:', data.data)
      } else {
        throw new Error('Invalid response format from lookup mappings API')
      }
    } catch (err) {
      console.error('Error fetching lookup mappings:', err)
      error.value = err.message

      // Fall back to empty mappings on error
      mappings.value = {
        categories: {},
        types: {},
        formats: {},
        sizes: {}
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