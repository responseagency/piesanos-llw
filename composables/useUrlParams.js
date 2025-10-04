import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useUrlParams() {
  const urlParams = ref(new URLSearchParams())

  // Update URL parameters from current location
  const updateParams = () => {
    urlParams.value = new URLSearchParams(window.location.search)
  }

  // Get a specific parameter value
  const getParam = (key) => {
    return urlParams.value.get(key)
  }

  // Check if a parameter exists and equals a specific value
  const hasParam = (key, value = null) => {
    const paramValue = urlParams.value.get(key)
    if (value === null) {
      return paramValue !== null
    }
    return paramValue === value
  }

  // Computed property for debug mode
  const isDebugMode = computed(() => {
    return hasParam('debug', 'true')
  })

  // Set up event listeners for URL changes
  const handlePopState = () => {
    updateParams()
  }

  onMounted(() => {
    updateParams()
    window.addEventListener('popstate', handlePopState)
  })

  onUnmounted(() => {
    window.removeEventListener('popstate', handlePopState)
  })

  return {
    urlParams,
    getParam,
    hasParam,
    isDebugMode,
    showDebug: isDebugMode, // Alias for compatibility
    updateParams
  }
}