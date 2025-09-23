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
          <div v-if="showFormatInfo && !hideFormatInfo && beverage.fields['Beverage Format']">
            <span class="font-medium">Format:</span> {{ getFormat(beverage) }}
          </div>
          <div v-if="showFormatInfo && !hideFormatInfo && beverage.fields['Selected Size']">
            <span class="font-medium">Size:</span> {{ getSize(beverage) }}
          </div>
          <div v-if="beverage.fields['ABV (from Beverage Item)']">
            <span class="font-medium">ABV:</span> {{ getABV(beverage) }}%
          </div>
          <div v-if="beverage.fields['Producer (from Beverage Item)']">
            <span class="font-medium">Producer:</span> {{ getProducer(beverage) }}
          </div>
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
    },
    hideGlassInfo: {
      type: Boolean,
      default: false
    },
    hideFormatInfo: {
      type: Boolean,
      default: false
    },
    showFormatInfo: {
      type: Boolean,
      default: true
    },
    hideFormatKeywords: {
      type: Boolean,
      default: false
    },
    useCleanNames: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    getBeverageName(beverage) {
      if (this.useCleanNames) {
        return this.buildCleanName(beverage)
      }

      let name = beverage.fields.Name || 'Unnamed Beverage'

      // Remove price from name if it's there
      name = name.replace(/\s*:\s*\$[\d.]+$/, '')

      // Remove glass/container information if hideGlassInfo is enabled
      if (this.hideGlassInfo) {
        name = name.replace(/\s*-\s*(Martini Glass|Cocktail Glass|Glass)\s*$/, '')
      }

      return name
    },

    buildCleanName(beverage) {
      const producer = beverage.fields['Producer (from Beverage Item)']
      const beverageItemName = this.getBeverageItemName(beverage)
      const volume = beverage.fields['Volume']

      // Build name: Producer BeverageItemName - Volume oz
      let cleanName = ''

      if (producer && producer.length > 0) {
        cleanName += producer[0]
      }

      if (beverageItemName) {
        if (cleanName) cleanName += ' '
        cleanName += beverageItemName
      }

      // Add volume if available
      if (volume && volume.length > 0) {
        cleanName += ` - ${volume[0]} oz`
      }

      return cleanName || 'Unnamed Beverage'
    },

    getBeverageItemName(beverage) {
      // Since we don't have direct access to the beverage item name from lookup fields,
      // we'll extract the core beverage name by removing known format patterns
      const name = beverage.fields.Name || ''

      // Remove price first: " : $8"
      let cleanName = name.replace(/\s*:\s*\$[\d.]+$/, '')

      // Remove format patterns: " - Draught 16 oz Glass", " - Bottle 12 oz Can", etc.
      cleanName = cleanName.replace(/\s*-\s*(Draught|Bottle|Can)\s+\d+(?:\.\d+)?\s*oz\s+(Glass|Can|Bottle|Mini Bottle)/i, '')

      // If we have a producer, try to remove it from the beginning
      const producer = beverage.fields['Producer (from Beverage Item)']
      if (producer && producer.length > 0) {
        const producerName = producer[0]
        // Remove producer from beginning if it exists
        cleanName = cleanName.replace(new RegExp(`^${this.escapeRegex(producerName)}\\s*`, 'i'), '')
      }

      return cleanName.trim() || 'Unknown Beverage'
    },

    escapeRegex(string) {
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

      // Hide category for cocktails and hard seltzers since it's redundant
      if (categoryName === 'Cocktail' || categoryName === 'Martini' || categoryName === 'Hard Seltzer') {
        return null
      }

      return categoryName
    }
  }
}
</script>