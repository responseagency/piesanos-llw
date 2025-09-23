<template>
  <div class="menu-section mb-12">
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

    <!-- Groups/Subcategories -->
    <div class="space-y-8 ml-8">
      <div
        v-for="group in section.groups"
        :key="group.id"
        class="menu-group mb-8"
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
            {{ getUniqueItemCount(group) }} unique {{ itemDisplayName.toLowerCase() }}
          </div>
        </div>

        <!-- Items Grid -->
        <div class="grid gap-4" :class="gridClasses">
          <GenericMenuItem
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
import GenericMenuItem from './GenericMenuItem.vue'

interface Props {
  section: MenuSection
  config: MenuConfig
  categoryMapping?: Record<string, string>
}

const props = defineProps<Props>()

// Computed properties
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
  // Try to infer item type from section name or use generic term
  const sectionName = props.section.displayName.toLowerCase()
  if (sectionName.includes('wine')) return 'wines'
  if (sectionName.includes('beer')) return 'beers'
  if (sectionName.includes('cocktail')) return 'cocktails'
  if (sectionName.includes('food')) return 'items'
  if (sectionName.includes('pizza')) return 'pizzas'
  return 'items'
})

const headerBorderColor = computed(() => {
  // Different colors for different section types
  const sectionName = props.section.name.toLowerCase()
  if (sectionName.includes('wine')) return 'border-purple-600'
  if (sectionName.includes('beer')) return 'border-yellow-600'
  if (sectionName.includes('cocktail')) return 'border-pink-600'
  if (sectionName.includes('food') || sectionName.includes('pizza')) return 'border-red-600'
  return 'border-blue-600'
})

const gridClasses = computed(() => {
  const itemsPerRow = props.config.displayOptions?.itemsPerRow || 3
  return `grid-cols-1 md:grid-cols-${Math.min(itemsPerRow, 2)} lg:grid-cols-${itemsPerRow}`
})

// Methods
function getGroupDisplayName(group: any): string {
  // Remove section name prefix if present
  const sectionPrefix = `${props.section.displayName} - `
  if (group.name.startsWith(sectionPrefix)) {
    return group.name.slice(sectionPrefix.length)
  }
  return group.name
}

function getUniqueItemCount(group: any): number {
  // For wine groups that might have multiple serving sizes, count unique base items
  if (props.section.name.includes('wine') && group.metadata?.grouped) {
    return Object.keys(group.metadata.grouped).length
  }
  return group.items.length
}
</script>