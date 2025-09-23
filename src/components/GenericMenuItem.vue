<template>
  <div class="menu-item bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
    <!-- Item Image (if available) -->
    <div v-if="item.imageUrl" class="aspect-w-16 aspect-h-9 mb-4">
      <img
        :src="item.imageUrl"
        :alt="item.name"
        class="w-full h-48 object-cover rounded-t-lg"
      />
    </div>

    <div class="p-4">
      <!-- Item Header -->
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-semibold text-gray-900 flex-1">
          {{ item.name }}
        </h3>

        <!-- Availability Badge -->
        <span
          v-if="showAvailability"
          class="ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0"
          :class="availabilityClasses"
        >
          {{ availabilityText }}
        </span>
      </div>

      <!-- Description -->
      <p
        v-if="item.description"
        class="text-sm text-gray-600 mb-3 line-clamp-2"
      >
        {{ item.description }}
      </p>

      <!-- Categories/Tags -->
      <div
        v-if="itemCategories.length > 0"
        class="flex flex-wrap gap-1 mb-3"
      >
        <span
          v-for="category in itemCategories"
          :key="category.id"
          class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
        >
          {{ category.name }}
        </span>
      </div>

      <!-- Multi-format Pricing (for wine-style items) -->
      <div v-if="isMultiFormat" class="space-y-2">
        <div
          v-for="serving in servings"
          :key="`${serving.format}-${serving.size}`"
          class="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0"
        >
          <span class="text-sm text-gray-600">
            {{ serving.format }} ({{ serving.size }}{{ serving.unit || 'oz' }})
          </span>
          <span class="font-semibold text-gray-900">
            ${{ serving.price?.toFixed(2) || '0.00' }}
          </span>
        </div>
      </div>

      <!-- Single Price -->
      <div v-else class="flex justify-between items-center">
        <span v-if="item.metadata?.format" class="text-sm text-gray-600">
          {{ item.metadata.format }}
        </span>
        <span class="text-lg font-bold text-gray-900">
          ${{ (item.price || 0).toFixed(2) }}
        </span>
      </div>

      <!-- Additional Metadata -->
      <div
        v-if="additionalInfo.length > 0"
        class="mt-3 pt-2 border-t border-gray-100"
      >
        <div class="flex flex-wrap gap-2 text-xs text-gray-500">
          <span
            v-for="info in additionalInfo"
            :key="info.key"
            class="bg-gray-50 px-2 py-1 rounded"
          >
            {{ info.label }}: {{ info.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BaseItem, MenuConfig, Category } from '@/core/types'

interface Props {
  item: BaseItem
  config: MenuConfig
  categoryMapping?: Record<string, string>
  servings?: Array<{
    format: string
    size: number
    unit?: string
    price?: number
  }>
}

const props = defineProps<Props>()

// Computed properties
const showAvailability = computed(() => {
  return props.item.isAvailable !== undefined
})

const availabilityClasses = computed(() => {
  if (props.item.isAvailable === false) {
    return 'bg-red-100 text-red-800'
  }
  return 'bg-green-100 text-green-800'
})

const availabilityText = computed(() => {
  if (props.item.isAvailable === false) {
    return 'Unavailable'
  }
  return 'Available'
})

const itemCategories = computed(() => {
  const categoryIds = props.item.metadata?.categoryIds || []
  const mapping = props.categoryMapping || {}

  return categoryIds.map((id: string) => ({
    id,
    name: mapping[id] || `Category ${id.slice(-6)}`
  }))
})

const isMultiFormat = computed(() => {
  return props.servings && props.servings.length > 1
})

const servings = computed(() => {
  return props.servings || []
})

const additionalInfo = computed(() => {
  const info: Array<{ key: string; label: string; value: string }> = []
  const metadata = props.item.metadata || {}

  // Add relevant metadata as additional info
  if (metadata.abv) {
    info.push({ key: 'abv', label: 'ABV', value: `${metadata.abv}%` })
  }

  if (metadata.vintage) {
    info.push({ key: 'vintage', label: 'Vintage', value: metadata.vintage })
  }

  if (metadata.origin) {
    info.push({ key: 'origin', label: 'Origin', value: metadata.origin })
  }

  if (metadata.style) {
    info.push({ key: 'style', label: 'Style', value: metadata.style })
  }

  return info
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>