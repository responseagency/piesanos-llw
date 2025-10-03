<template>
  <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
    <h2 class="text-xl font-semibold mb-4">Menu Overview</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
      <div
        v-for="(stats, type) in beverageStats"
        :key="type"
        class="text-center"
      >
        <div class="text-2xl font-bold text-gray-900">{{ stats.count }}</div>
        <div class="text-sm text-gray-600">{{ type }}</div>
        <div v-if="stats.avgPrice > 0" class="text-xs text-gray-500">
          Avg: ${{ stats.avgPrice }}
        </div>
      </div>
    </div>

    <!-- Dynamic Category Mapping Stats -->
    <div v-if="mappingStats" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="text-sm font-semibold text-blue-800 mb-2">Smart Category Mapping</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="text-center">
          <div class="text-lg font-bold text-blue-600">{{ mappingStats.totalCategories }}</div>
          <div class="text-blue-700">Total Categories</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-green-600">{{ mappingStats.dynamicallyMapped }}</div>
          <div class="text-green-700">Auto-Detected</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-yellow-600">{{ mappingStats.fallbackMapped }}</div>
          <div class="text-yellow-700">Manual Mapping</div>
        </div>
        <div class="text-center">
          <div class="text-lg font-bold text-red-600">{{ mappingStats.unmapped }}</div>
          <div class="text-red-700">Unmapped</div>
        </div>
      </div>
      <div v-if="mappingStats.dynamicallyMapped > 0" class="text-xs text-blue-600 mt-2">
        🤖 {{ mappingStats.dynamicallyMapped }} categories automatically detected from beverage names!
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SummaryStats',
  props: {
    beverageStats: {
      type: Object,
      required: true,
      default: () => ({})
    },
    mappingStats: {
      type: Object,
      required: false,
      default: null
    }
  }
}
</script>