<template>
  <div
    :class="[
      'px-4 py-2 md:p-4   transition-shadow',
      isFeaturedAtCurrentLocation()
        ? 'border-1 rounded-tr-lg rounded-br-lg border-gold-800'
        : 'border-1 border-transparent',
    ]"
  >
    <!-- Main content -->
    <div class="flex justify-between items-start">
      <div class="flex-1">
        <h3 class="font-medium text-gray-900 text-base uppercase tracking-wide mb-2">
          {{ getBeverageName() }}
        </h3>

        <!-- Category and format info -->
        <div class="text-xs text-gray-600 space-y-1">
          <!-- <div v-if="beverageCategory" class="flex items-center gap-2">
            <span class="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
              {{ beverageCategory }}
            </span>
          </div> -->
          
          <!-- Format info for non-wine beverages -->
          <div v-if="showFormatInfo && !hideGlassInfo && beverageType !== 'Cocktails' && getFormat() !== 'Bottle' && getFormat() !== 'Wine Bottle' && getFormat() !== 'Can'" class="flex flex-nowrap items-center gap-2 text-gray-700 text-sm leading-relaxed">
            <div v-if="beverageCategory">{{ beverageCategory }}</div>
            <span v-if="beverageCategory"> ⸱ </span>
            <div v-if="getABV()">{{ getABV() }}%</div>
            <span v-if="getABV()"> ⸱ </span>
            <div v-if="getOrigin()">{{ getOrigin() }}</div>
          </div>

          <!-- Pairings -->
          <div v-if="getPairings()" class="text-xs text-gold-800 mt-1 uppercase">
            {{ getPairings() }}
          </div>
        </div>

        <!-- Producer info -->
        <!-- <div v-if="getProducer()" class="mt-1 text-xs text-gray-600">
          <span class="font-medium">Producer:</span> {{ getProducer() }}
        </div> -->

        <!-- Location info if available -->
        <!-- <div v-if="getLocation()" class="mt-1 text-xs text-gray-600">
          <span class="font-medium">Location:</span> {{ getLocation() }}
        </div> -->
      </div>

      <!-- Price -->
      <div class="text-right ml-4">
        <span class="text-base  font-bold text-gray-900">
          {{ getPrice() }}
        </span>
      </div>
    </div>

    <!-- Notes -->
    <div v-if="getNotes()" class="mt-2 text-base font-light text-gray-700">
      {{ getNotes() }}
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'

export default {
  name: 'BeverageItem',
  props: {
    beverage: {
      type: Object,
      required: true
    },
    showFormatInfo: {
      type: Boolean,
      default: true
    },
    hideGlassInfo: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    // Inject the dynamic category mapping and location filter from the parent
    const categoryMapping = inject('categoryMapping', null)
    const locationFilter = inject('locationFilter', null)

    return {
      categoryMapping,
      locationFilter
    }
  },
  computed: {
    beverageCategory() {
      if (!this.categoryMapping) return null

      const categories = this.beverage.fields['Beverage Categories (from Beverage Item)']
      if (!categories || categories.length === 0) return null

      const categoryId = categories[0]
      return this.categoryMapping.getCategoryName(categoryId)
    },
    beverageType() {
      const type = this.beverage.fields['Beverage Type Resolved']
      if (!type || type.length === 0) return null
      return Array.isArray(type) ? type[0] : type
    }
  },
  methods: {
    getBeverageName() {
      const name = this.beverage.fields.Name || 'Unknown Beverage'
      const producer = this.beverage.fields['Producer (from Beverage Item)']

      // Format: "Producer Item - Format Size : Price"
      // Take everything before the first " - "
      const firstDashIndex = name.indexOf(' - ')
      if (firstDashIndex > 0) {
        const producerAndItem = name.substring(0, firstDashIndex)

        // If we have producer from lookup field, verify it matches and extract just the item
        if (producer && producer.length > 0) {
          const producerName = producer[0]
          // If the name starts with the producer, we know the format is correct
          if (producerAndItem.startsWith(producerName)) {
            // Return the full "Producer Item" part
            return producerAndItem
          }
        }

        // Otherwise just return what we parsed
        return producerAndItem
      }

      return name
    },

    getPrice() {
      const price = this.beverage.fields.Price
      return price ? price.toString() : '0'
    },

    getFormat() {
      // Use the resolved format field from the server
      const resolvedFormat = this.beverage.fields['Beverage Format Resolved']
      const rawFormat = this.beverage.fields['Beverage Format']

      // Debug logging
      console.log('Format debug:', {
        name: this.beverage.fields.Name,
        rawFormat,
        resolvedFormat
      })

      if (resolvedFormat && resolvedFormat.length > 0) {
        return resolvedFormat[0]
      }
      return null
    },

    getVolume() {
      const volume = this.beverage.fields.Volume
      return volume && volume.length > 0 ? volume[0] : null
    },

    getABV() {
      const abv = this.beverage.fields['ABV (from Beverage Item)']
      if (!abv || abv.length === 0) return null

      // ABV is stored as decimal (0.05 = 5%), convert to percentage
      const abvValue = abv[0]
      return abvValue ? (abvValue * 100).toFixed(1) : null
    },

    getProducer() {
      const producer = this.beverage.fields['Producer (from Beverage Item)']
      return producer && producer.length > 0 ? producer[0] : null
    },

    getOrigin() {
      const origin = this.beverage.fields['Origin (from Beverage Item)']
      return origin && origin.length > 0 ? origin[0] : null
    },

    getLocation() {
      const location = this.beverage.fields['Location (from Producer)']
      return location && location.length > 0 ? location[0] : null
    },

    getNotes() {
      const notes = this.beverage.fields.Notes
      return notes && notes.length > 0 ? notes[0] : null
    },

    getPairings() {
      const pairings = this.beverage.fields.Pairing
      return pairings || null
    },

    isFeaturedAtCurrentLocation() {
      // Check if beverage is featured at the currently selected location
      if (!this.locationFilter || !this.locationFilter.selectedLocationId.value) {
        return false
      }

      const featured = this.beverage.fields.Featured
      if (!featured || !Array.isArray(featured)) {
        return false
      }

      return featured.includes(this.locationFilter.selectedLocationId.value)
    }
  }
}
</script>