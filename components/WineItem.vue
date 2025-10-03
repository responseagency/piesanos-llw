<template>
  <div :class="[
    'px-4 py-2 md:p-4 transition-shadow',
    isFeaturedAtCurrentLocation()
      ? 'border-1 rounded-tr-lg rounded-br-lg border-gold-800'
      : 'border-1 border-transparent'
  ]">
    <!-- Main content -->
    <div class="flex justify-between items-start mb-2">
      <div class="flex-1">
        <h3 class="font-medium text-gray-900 text-base uppercase tracking-wide">
          {{ wineGroup.baseName }}
        </h3>
      </div>

      <!-- Price -->
      <div class="text-right ml-4">
        <span class="text-base font-bold text-gray-900">
          {{ priceDisplay }}
        </span>
      </div>
    </div>

    <!-- Category and metadata info -->
    <div class="text-sm text-gray-600 flex flex-nowrap items-center gap-2 leading-relaxed">
      <div v-if="wineMetadata.category">{{ wineMetadata.category }}</div>
      <span v-if="wineMetadata.category && wineMetadata.abv"> ⸱ </span>
      <div v-if="wineMetadata.abv">{{ wineMetadata.abv }}%</div>
      <span v-if="(wineMetadata.category || wineMetadata.abv) && wineMetadata.origin"> ⸱ </span>
      <div v-if="wineMetadata.origin">{{ wineMetadata.origin }}</div>
    </div>

    <!-- Notes (if present) -->
    <div v-if="wineMetadata.notes" class="mt-2 text-base font-light text-gray-700">
      {{ wineMetadata.notes }}
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
    // Inject the location filter from the parent
    const locationFilter = inject('locationFilter', null)

    return {
      categoryMapping,
      locationFilter
    }
  },
  computed: {
    normalizedServings() {
      const servingMap = {
        glass6oz: null,
        glass9oz: null,
        bottle: null
      }

      const FORMAT_IDS = {
        GLASS: 'recDlaYGEmS23x6gB',
        BOTTLE: 'recJOuYK67z0S23Gg'
      }

      this.wineGroup.servings.forEach(serving => {
        const volume = serving.fullRecord.fields.Volume?.[0]
        const formatId = serving.fullRecord.fields['Beverage Format']?.[0]

        // Map to serving type - handle slight volume variations (6-6.5oz)
        if (formatId === FORMAT_IDS.GLASS && volume >= 5.5 && volume <= 6.5) {
          servingMap.glass6oz = serving
        } else if (formatId === FORMAT_IDS.GLASS && volume >= 8.5 && volume <= 9.5) {
          servingMap.glass9oz = serving
        } else if (formatId === FORMAT_IDS.BOTTLE) {
          servingMap.bottle = serving
        }
      })

      return servingMap
    },

    wineMetadata() {
      // Get metadata from first serving
      if (!this.wineGroup.servings.length) {
        return { category: null, abv: null, origin: null, notes: null }
      }

      const firstServing = this.wineGroup.servings[0].fullRecord
      return {
        category: this.getBeverageCategory(firstServing),
        abv: this.getABV(firstServing),
        origin: this.getOrigin(firstServing),
        notes: this.getNotes(firstServing)
      }
    },

    priceDisplay() {
      const formatPrice = (price) => {
        // Remove trailing zeros and unnecessary decimal point
        // 12.00 -> 12, 19.50 -> 19.5, 8.25 -> 8.25
        return price.toFixed(2).replace(/\.?0+$/, '')
      }

      const prices = []

      // 6oz Glass
      if (this.normalizedServings.glass6oz) {
        prices.push(formatPrice(this.normalizedServings.glass6oz.price))
      } else {
        prices.push('−')
      }

      // 9oz Glass
      if (this.normalizedServings.glass9oz) {
        prices.push(formatPrice(this.normalizedServings.glass9oz.price))
      } else {
        prices.push('−')
      }

      // Bottle
      if (this.normalizedServings.bottle) {
        prices.push(formatPrice(this.normalizedServings.bottle.price))
      } else {
        prices.push('−')
      }

      return prices.join(' / ')
    }
  },
  methods: {
    getBeverageCategory(wine) {
      const categories = wine.fields['Beverage Categories (from Beverage Item)']
      if (!categories || !categories.length) return null

      // Use dynamic category mapping if available, otherwise fall back to static mapping
      if (this.categoryMapping && this.categoryMapping.getCategoryName) {
        return this.categoryMapping.getCategoryName(categories[0])
      }

      return getBeverageCategoryName(categories[0])
    },

    getABV(wine) {
      const abv = wine.fields['ABV (from Beverage Item)']
      if (!abv || abv.length === 0) return null
      return (abv[0] * 100).toFixed(1)
    },

    getOrigin(wine) {
      const origin = wine.fields['Origin (from Beverage Item)']
      return origin && origin.length > 0 ? origin[0] : null
    },

    getNotes(wine) {
      const notes = wine.fields['Notes (from Beverage Item)']
      return notes && notes.length > 0 ? notes[0] : null
    },

    isFeaturedAtCurrentLocation() {
      // Check if any serving of this wine group is featured at the currently selected location
      if (!this.locationFilter || !this.locationFilter.selectedLocationId.value) {
        return false
      }

      return this.wineGroup.servings.some(serving => {
        const featured = serving.fullRecord.fields['Featured']
        if (!featured || !Array.isArray(featured)) {
          return false
        }
        return featured.includes(this.locationFilter.selectedLocationId.value)
      })
    }
  }
}
</script>