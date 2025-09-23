<template>
  <div class="beverage-item bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
    <div class="p-4">
      <!-- Wine with Multiple Servings -->
      <div v-if="isWineWithServings" class="wine-item">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-900 flex-1">
            {{ wineBaseName }}
          </h3>
          <span class="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
            {{ wineVarietal }}
          </span>
        </div>

        <!-- Multiple Serving Options -->
        <div class="space-y-2">
          <div
            v-for="serving in wineServings"
            :key="`${serving.format}-${serving.size}`"
            class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
          >
            <div class="flex items-center">
              <span class="text-sm font-medium text-gray-700">
                {{ serving.format }}
              </span>
              <span class="text-xs text-gray-500 ml-2">
                ({{ serving.size }}oz {{ serving.container }})
              </span>
            </div>
            <span class="font-semibold text-gray-900">
              ${{ serving.price?.toFixed(2) || '0.00' }}
            </span>
          </div>
        </div>

        <!-- Wine Details -->
        <div v-if="wineDetails.length > 0" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="detail in wineDetails"
            :key="detail.key"
            class="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded"
          >
            {{ detail.label }}: {{ detail.value }}
          </span>
        </div>
      </div>

      <!-- Regular Beverage Item -->
      <div v-else class="regular-item">
        <div class="flex items-start justify-between mb-2">
          <h3 class="text-lg font-semibold text-gray-900 flex-1">
            {{ displayName }}
          </h3>

          <!-- Category Badge -->
          <span
            v-if="primaryCategory"
            class="ml-2 px-2 py-1 text-xs font-medium rounded-full flex-shrink-0"
            :class="categoryBadgeClasses"
          >
            {{ primaryCategory }}
          </span>
        </div>

        <!-- Serving Info and Price -->
        <div class="flex justify-between items-center">
          <span v-if="servingInfo" class="text-sm text-gray-600">
            {{ servingInfo }}
          </span>
          <span class="text-lg font-bold text-gray-900">
            ${{ (item.price || 0).toFixed(2) }}
          </span>
        </div>

        <!-- Additional Info -->
        <div v-if="beverageInfo.length > 0" class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="info in beverageInfo"
            :key="info.key"
            class="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded"
          >
            {{ info.label }}: {{ info.value }}
          </span>
        </div>
      </div>

      <!-- Availability Indicator -->
      <div
        v-if="showAvailability && !item.isAvailable"
        class="mt-3 pt-2 border-t border-gray-100"
      >
        <span class="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
          Currently Unavailable
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BaseItem, MenuConfig } from '@/core/types'

interface WineServing {
  format: string
  size: number
  container: string
  price?: number
  fullRecord: BaseItem
}

interface Props {
  item: BaseItem
  config: MenuConfig
  categoryMapping?: Record<string, string>
  wineServings?: WineServing[]
  wineBaseName?: string
}

const props = defineProps<Props>()

// Computed properties
const isWineWithServings = computed(() => {
  return props.wineServings && props.wineServings.length > 1
})

const displayName = computed(() => {
  // Clean up beverage names by removing format/price info
  let name = props.item.name

  // Remove pricing info
  name = name.replace(/\s*:\s*\$[\d.]+\s*$/, '')

  // Remove serving size for draught items
  name = name.replace(/\s*-\s*\d+(\.\d+)?\s*oz\s*(Glass|Snifter)\s*$/, '')

  return name
})

const servingInfo = computed(() => {
  const name = props.item.name.toLowerCase()

  // Extract serving size and container
  const sizeMatch = name.match(/(\d+(?:\.\d+)?)\s*oz/)
  const containerMatch = name.match(/oz\s+(glass|snifter|bottle|can)/)

  if (sizeMatch && containerMatch) {
    return `${sizeMatch[1]}oz ${containerMatch[1]}`
  }

  if (name.includes('bottle')) return 'Bottle'
  if (name.includes('can')) return 'Can'
  if (name.includes('draught') || name.includes('draft')) return 'Draught'

  return null
})

const primaryCategory = computed(() => {
  const categoryIds = props.item.metadata?.categoryIds || []
  if (categoryIds.length === 0 || !props.categoryMapping) return null

  return props.categoryMapping[categoryIds[0]] || null
})

const categoryBadgeClasses = computed(() => {
  const category = primaryCategory.value?.toLowerCase() || ''

  // Beer styles
  if (category.includes('ipa')) return 'bg-yellow-100 text-yellow-800'
  if (category.includes('stout') || category.includes('porter')) return 'bg-amber-100 text-amber-800'
  if (category.includes('lager') || category.includes('pilsner')) return 'bg-blue-100 text-blue-800'
  if (category.includes('wheat')) return 'bg-orange-100 text-orange-800'

  // Wine styles
  if (category.includes('cabernet') || category.includes('merlot')) return 'bg-red-100 text-red-800'
  if (category.includes('chardonnay') || category.includes('sauvignon')) return 'bg-green-100 text-green-800'
  if (category.includes('rosé')) return 'bg-pink-100 text-pink-800'

  // Default
  return 'bg-gray-100 text-gray-800'
})

const wineVarietal = computed(() => {
  if (!isWineWithServings.value) return null
  return primaryCategory.value
})

const wineServings = computed(() => {
  return props.wineServings || []
})

const wineBaseName = computed(() => {
  return props.wineBaseName || props.item.name
})

const showAvailability = computed(() => {
  return props.item.isAvailable !== undefined
})

const beverageInfo = computed(() => {
  const info: Array<{ key: string; label: string; value: string }> = []
  const metadata = props.item.metadata || {}

  if (metadata.abv) {
    info.push({ key: 'abv', label: 'ABV', value: `${metadata.abv}%` })
  }

  if (metadata.brewery) {
    info.push({ key: 'brewery', label: 'Brewery', value: metadata.brewery })
  }

  if (metadata.origin) {
    info.push({ key: 'origin', label: 'Origin', value: metadata.origin })
  }

  return info
})

const wineDetails = computed(() => {
  if (!isWineWithServings.value) return []

  const info: Array<{ key: string; label: string; value: string }> = []
  const metadata = props.item.metadata || {}

  if (metadata.vintage) {
    info.push({ key: 'vintage', label: 'Vintage', value: metadata.vintage })
  }

  if (metadata.region) {
    info.push({ key: 'region', label: 'Region', value: metadata.region })
  }

  if (metadata.abv) {
    info.push({ key: 'abv', label: 'ABV', value: `${metadata.abv}%` })
  }

  return info
})
</script>