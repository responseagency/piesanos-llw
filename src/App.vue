<template>
  <div class="p-4">
    <p class="text-sm text-gray-600 mb-4">Last updated: {{ lastUpdated || 'Never' }}</p>

    <div v-if="loading">Loading...</div>
    <div v-else-if="error">Error: {{ error }}</div>
    <div v-else-if="data">
      <pre>{{ JSON.stringify(data, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useAirtable } from './composables/useAirtable'

export default {
  name: 'App',
  setup() {
    const { data, loading, error, fetchData } = useAirtable()
    const lastUpdated = ref(null)

    const loadData = async () => {
      await fetchData()
      if (!error.value) {
        lastUpdated.value = new Date().toLocaleString()
      }
    }

    onMounted(() => {
      loadData()
    })

    return {
      data,
      loading,
      error,
      lastUpdated
    }
  }
}
</script>