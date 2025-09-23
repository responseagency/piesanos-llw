<template>
  <div class="beverage-section mb-12">
    <!-- Section Header -->
    <div class="mb-8 border-l-4 pl-6 ml-2" :class="headerBorderColor">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">
        <span v-if="section.icon" class="mr-2">{{ section.icon }}</span>
        {{ section.displayName }}
      </h1>
      <div class="text-lg text-gray-600">
        {{ totalItemCount }} {{ itemDisplayName }} available
        <span v-if="avgPrice > 0">
          • Average: ${{ avgPrice }}
        </span>
      </div>
    </div>

    <!-- Subcategories -->
    <div class="space-y-8 ml-8">
      <div
        v-for="group in section.groups"
        :key="group.id"
        class="beverage-group mb-8"
      >
        <!-- Group Header (if multiple groups) -->
        <div
          v-if="section.groups.length > 1"
          class="flex items-center justify-between mb-4"
        >
          <h2 class="text-xl font-semibold text-gray-700">
            {{ getGroupDisplayName(group) }}
          </h2>
          <div class="text-sm text-gray-600">
            {{ getGroupItemCount(group) }} {{ itemDisplayName.toLowerCase() }}
          </div>
        </div>

        <!-- Wine Items (with grouping) -->
        <div v-if="isWineSection" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <BeverageMenuItem
            v-for="(wineGroup, wineName) in getGroupedWines(group)"
            :key="wineName"
            :item="getRepresentativeItem(wineGroup)"
            :config="config"
            :category-mapping="categoryMapping"
            :wine-servings="wineGroup.servings"
            :wine-base-name="wineGroup.baseName"
          />
        </div>

        <!-- Regular Items -->
        <div v-else class="grid gap-4" :class="gridClasses">
          <BeverageMenuItem
            v-for="item in group.items"
            :key="item.id"
            :item="item"
            :config="config"
            :category-mapping="categoryMapping"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MenuSection, MenuConfig, BaseItem } from '@/core/types'
import BeverageMenuItem from './BeverageMenuItem.vue'

interface Props {
  section: MenuSection
  config: MenuConfig
  categoryMapping?: Record<string, string>
}

const props = defineProps<Props>()

// Helper function to group wines by base name (similar to your current logic)
function groupWinesByBaseName(wines: BaseItem[]) {
  const grouped: Record<string, { baseName: string; wines: BaseItem[]; servings: any[] }> = {}

  wines.forEach(wine => {
    const beverageCategories = wine.metadata?.categoryIds || []
    const groupingKey = extractWineBaseName(wine.name, beverageCategories)
    const serving = parseWineServing(wine.name)

    // Extract display name
    const displayName = wine.name.match(/^(.+?)\s*-\s*Wine/)
      ? wine.name.match(/^(.+?)\s*-\s*Wine/)![1].trim()
      : wine.name

    if (!grouped[groupingKey]) {
      grouped[groupingKey] = {
        baseName: displayName,
        wines: [],
        servings: []
      }
    }

    grouped[groupingKey].wines.push(wine)
    grouped[groupingKey].servings.push({
      ...serving,
      fullRecord: wine
    })
  })

  // Sort servings by size (glasses first, then bottles)
  Object.keys(grouped).forEach(groupingKey => {
    grouped[groupingKey].servings.sort((a, b) => {
      if (a.format !== b.format) {
        return a.format === 'Glass' ? -1 : 1
      }
      return a.size - b.size
    })
  })

  return grouped
}

function extractWineBaseName(fullName: string, beverageCategories: string[]) {
  const match = fullName.match(/^(.+?)\s*-\s*Wine/)
  const baseName = match ? match[1].trim() : fullName
  const categoryKey = beverageCategories ? beverageCategories.join('|') : 'unknown'
  return `${baseName}__${categoryKey}`
}

function parseWineServing(fullName: string) {
  const formatMatch = fullName.match(/Wine\s+(Glass|Bottle)/)
  const sizeMatch = fullName.match(/(\d+(?:\.\d+)?)\s*oz/)
  const containerMatch = fullName.match(/oz\s+(Glass|Bottle|Mini Bottle)/)
  const priceMatch = fullName.match(/\$(\d+(?:\.\d+)?)/)

  return {
    format: formatMatch ? formatMatch[1] : 'Unknown',
    size: sizeMatch ? parseFloat(sizeMatch[1]) : 0,
    container: containerMatch ? containerMatch[1] : 'Unknown',
    price: priceMatch ? parseFloat(priceMatch[1]) : 0
  }
}

// Computed properties
const isWineSection = computed(() => {
  return props.section.name.includes('wine')
})

const totalItemCount = computed(() => {
  return props.section.groups.reduce((total, group) => total + group.items.length, 0)
})

const avgPrice = computed(() => {
  const allItems = props.section.groups.flatMap(group => group.items)
  const prices = allItems.map(item => item.price).filter(p => p && p > 0) as number[]

  if (prices.length === 0) return 0

  const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length
  return avg.toFixed(2)
})

const itemDisplayName = computed(() => {
  const sectionName = props.section.displayName.toLowerCase()
  if (sectionName.includes('wine')) return 'wines'
  if (sectionName.includes('beer')) return 'beers'
  if (sectionName.includes('cocktail')) return 'cocktails'
  return 'beverages'
})

const headerBorderColor = computed(() => {
  const sectionName = props.section.name.toLowerCase()
  if (sectionName.includes('wine')) return 'border-purple-600'
  if (sectionName.includes('beer')) return 'border-yellow-600'
  if (sectionName.includes('cocktail')) return 'border-pink-600'
  return 'border-blue-600'
})

const gridClasses = computed(() => {
  const itemsPerRow = props.config.displayOptions?.itemsPerRow || 3
  return `grid-cols-1 md:grid-cols-${Math.min(itemsPerRow, 2)} lg:grid-cols-${itemsPerRow}`
})

// Methods
function getGroupDisplayName(group: any): string {
  const sectionPrefix = `${props.section.displayName} - `
  if (group.name.startsWith(sectionPrefix)) {
    return group.name.slice(sectionPrefix.length)
  }
  return group.name
}

function getGroupItemCount(group: any): number {
  if (isWineSection.value) {
    return Object.keys(groupWinesByBaseName(group.items)).length
  }
  return group.items.length
}

function getGroupedWines(group: any) {
  if (!isWineSection.value) return {}
  return groupWinesByBaseName(group.items)
}

function getRepresentativeItem(wineGroup: any): BaseItem {
  // Return the first wine item as representative
  return wineGroup.wines[0]
}
</script>