<template>
  <div class="beverage-section mb-8">
    <div class="flex items-center justify-between mb-4">
      <h2 :class="isSubcategory ? 'text-xl font-semibold text-gray-700' : 'text-2xl font-bold text-gray-800'">{{ type }}</h2>
      <div class="text-sm text-gray-600">
        {{ beverages.length }} items
        <span v-if="stats.avgPrice > 0">
          • Avg: ${{ stats.avgPrice }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="beverage in beverages"
        :key="beverage.id"
        class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex justify-between items-start mb-2">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 text-sm leading-tight">
              {{ getBeverageName(beverage) }}
            </h3>
            <div v-if="getBeverageCategory(beverage)" class="mt-1">
              <span class="inline-block bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                {{ getBeverageCategory(beverage) }}
              </span>
            </div>
          </div>
          <span class="text-lg font-bold text-green-600 ml-2">
            ${{ beverage.fields.Price }}
          </span>
        </div>

        <div class="text-xs text-gray-600 space-y-1">
          <div v-if="beverage.fields['Beverage Format']">
            <span class="font-medium">Format:</span> {{ getFormat(beverage) }}
          </div>
          <div v-if="beverage.fields['Selected Size']">
            <span class="font-medium">Size:</span> {{ getSize(beverage) }}
          </div>
          <div v-if="beverage.fields['ABV (from Beverage Item)']">
            <span class="font-medium">ABV:</span> {{ getABV(beverage) }}%
          </div>
          <div v-if="beverage.fields['Producer (from Beverage Item)']">
            <span class="font-medium">Producer:</span> {{ getProducer(beverage) }}
          </div>
        </div>

        <div class="mt-2">
          <span
            :class="getValidityClass(beverage)"
            class="inline-block px-2 py-1 text-xs rounded-full"
          >
            {{ beverage.fields['Is valid size?'] || 'Unknown' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'
import { getBeverageCategoryName } from '../utils/beverageOrganizer'

export default {
  name: 'BeverageSection',
  setup() {
    // Inject the dynamic category mapping from the parent
    const categoryMapping = inject('categoryMapping', null)

    return {
      categoryMapping
    }
  },
  props: {
    type: {
      type: String,
      required: true
    },
    beverages: {
      type: Array,
      required: true
    },
    stats: {
      type: Object,
      default: () => ({})
    },
    isSubcategory: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getBeverageName(beverage) {
      const name = beverage.fields.Name || 'Unnamed Beverage'
      // Remove price from name if it's there
      return name.replace(/\s*:\s*\$[\d.]+$/, '')
    },

    getFormat(beverage) {
      // This would need to be mapped from format IDs if needed
      return 'Various'
    },

    getSize(beverage) {
      // This would need to be mapped from size IDs if needed
      return 'Standard'
    },

    getABV(beverage) {
      const abv = beverage.fields['ABV (from Beverage Item)']
      return abv ? (abv[0] * 100).toFixed(1) : 'N/A'
    },

    getProducer(beverage) {
      const producer = beverage.fields['Producer (from Beverage Item)']
      return producer ? producer[0] : 'Unknown'
    },

    getValidityClass(beverage) {
      const validity = beverage.fields['Is valid size?']
      if (validity === '✅ Valid') {
        return 'bg-green-100 text-green-800'
      } else if (validity?.includes('❗')) {
        return 'bg-yellow-100 text-yellow-800'
      }
      return 'bg-gray-100 text-gray-800'
    },

    getBeverageCategory(beverage) {
      const categories = beverage.fields['Beverage Categories (from Beverage Item)']
      if (!categories || !categories.length) return null

      // Use dynamic category mapping if available, otherwise fall back to static mapping
      let categoryName
      if (this.categoryMapping && this.categoryMapping.getCategoryName) {
        categoryName = this.categoryMapping.getCategoryName(categories[0])
      } else {
        categoryName = getBeverageCategoryName(categories[0])
      }

      // Hide category for cocktails since it's redundant
      if (categoryName === 'Cocktail' || categoryName === 'Martini') {
        return null
      }

      return categoryName
    }
  }
}
</script>