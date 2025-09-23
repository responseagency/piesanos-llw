<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
    <div class="mb-3">
      <h3 class="font-semibold text-gray-900 text-lg leading-tight">
        {{ wineGroup.baseName }}
      </h3>
      <div class="text-sm text-gray-600 mt-1">
        <span v-if="beverageCategory" class="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs mr-2">
          {{ beverageCategory }}
        </span>
        {{ wineGroup.servings.length }} serving option{{ wineGroup.servings.length > 1 ? 's' : '' }}
      </div>
    </div>

    <div class="space-y-2">
      <div
        v-for="(serving, index) in wineGroup.servings"
        :key="index"
        class="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
      >
        <div class="flex-1">
          <div class="font-medium text-gray-800">
            {{ serving.format }} {{ serving.size }}oz
            <span class="text-gray-600 text-sm">({{ serving.container }})</span>
          </div>
          <div class="text-xs text-gray-500 mt-1">
            <span v-if="serving.fullRecord.fields['Producer (from Beverage Item)']">
              {{ getProducer(serving.fullRecord) }} •
            </span>
            <span v-if="serving.fullRecord.fields['ABV (from Beverage Item)']">
              {{ getABV(serving.fullRecord) }}% ABV •
            </span>
            <span
              :class="getValidityClass(serving.fullRecord)"
              class="inline-block px-1 py-0.5 text-xs rounded"
            >
              {{ serving.fullRecord.fields['Is valid size?'] || 'Unknown' }}
            </span>
          </div>
        </div>
        <div class="text-right ml-4">
          <span class="text-lg font-bold text-green-600">
            ${{ serving.price.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Price range summary -->
    <div class="mt-3 pt-2 border-t border-gray-100 text-sm text-gray-600">
      <span v-if="priceRange.min !== priceRange.max">
        Price range: ${{ priceRange.min.toFixed(2) }} - ${{ priceRange.max.toFixed(2) }}
      </span>
      <span v-else>
        Single price: ${{ priceRange.min.toFixed(2) }}
      </span>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'
import { getBeverageCategoryName } from '../utils/beverageOrganizer'

export default {
  name: 'WineItem',
  props: {
    wineGroup: {
      type: Object,
      required: true
    }
  },
  setup() {
    // Inject the dynamic category mapping from the parent
    const categoryMapping = inject('categoryMapping', null)

    return {
      categoryMapping
    }
  },
  computed: {
    priceRange() {
      const prices = this.wineGroup.servings.map(s => s.price).filter(p => p > 0)
      return {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    },

    beverageCategory() {
      if (!this.wineGroup.servings.length) return null

      const categories = this.wineGroup.servings[0].fullRecord.fields['Beverage Categories (from Beverage Item)']
      if (!categories || !categories.length) return null

      // Use dynamic category mapping if available, otherwise fall back to static mapping
      if (this.categoryMapping && this.categoryMapping.getCategoryName) {
        return this.categoryMapping.getCategoryName(categories[0])
      }

      return getBeverageCategoryName(categories[0])
    }
  },
  methods: {
    getProducer(wine) {
      const producer = wine.fields['Producer (from Beverage Item)']
      return producer ? producer[0] : 'Unknown'
    },

    getABV(wine) {
      const abv = wine.fields['ABV (from Beverage Item)']
      return abv ? (abv[0] * 100).toFixed(1) : 'N/A'
    },

    getValidityClass(wine) {
      const validity = wine.fields['Is valid size?']
      if (validity === '✅ Valid') {
        return 'bg-green-100 text-green-800'
      } else if (validity?.includes('❗')) {
        return 'bg-yellow-100 text-yellow-800'
      }
      return 'bg-gray-100 text-gray-800'
    }
  }
}
</script>