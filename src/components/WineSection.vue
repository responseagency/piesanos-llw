<template>
  <div class="wine-section mb-12">
    <!-- Main Wine Heading -->
    <div class="mb-8 border-l-4 border-purple-600 pl-6 ml-2">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">🍷 Wine</h1>
      <div class="text-lg text-gray-600">
        {{ totalWineCount }} wines available
        <span v-if="avgWinePrice > 0">
          • Average: ${{ avgWinePrice }}
        </span>
      </div>
    </div>

    <!-- Wine Subcategories -->
    <div class="space-y-8 ml-8">
      <div
        v-for="(wines, subcategory) in wineSubcategories"
        :key="subcategory"
        class="wine-subcategory mb-8"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-700">{{ getSubcategoryDisplayName(subcategory) }}</h2>
          <div class="text-sm text-gray-600">
            {{ groupedWinesBySubcategory[subcategory] ? Object.keys(groupedWinesBySubcategory[subcategory]).length : 0 }} unique wines
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <WineItem
            v-for="(wineGroup, wineName) in groupedWinesBySubcategory[subcategory]"
            :key="wineName"
            :wine-group="wineGroup"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WineItem from './WineItem.vue'
import { groupWinesByBaseName } from '../utils/beverageOrganizer'

export default {
  name: 'WineSection',
  components: {
    WineItem
  },
  props: {
    wineSubcategories: {
      type: Object,
      required: true
    },
    stats: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    totalWineCount() {
      return Object.values(this.wineSubcategories).reduce((total, wines) => total + wines.length, 0)
    },

    avgWinePrice() {
      const allWines = Object.values(this.wineSubcategories).flat()
      const prices = allWines.map(wine => wine.fields.Price || 0).filter(p => p > 0)

      if (prices.length === 0) return 0

      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length
      return avg.toFixed(2)
    },

    groupedWinesBySubcategory() {
      const result = {}

      Object.keys(this.wineSubcategories).forEach(subcategory => {
        const wines = this.wineSubcategories[subcategory]
        result[subcategory] = groupWinesByBaseName(wines)
      })

      return result
    }
  },
  methods: {
    getSubcategoryDisplayName(subcategory) {
      // Remove "Wine - " prefix for subcategory display
      return subcategory.replace('Wine - ', '')
    }
  }
}
</script>