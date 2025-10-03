<template>
  <div class="sampler-item bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
    <!-- Title and Price -->
    <div class="flex justify-between items-start mb-4">
      <div class="flex-1">
        <h3 class="font-bold text-gray-900 text-lg uppercase tracking-wide">
          {{ getSamplerTitle() }}
        </h3>
      </div>
      <div class="text-right ml-4">
        <span class="text-2xl font-bold text-gray-900">
          {{ getSamplerPrice() }}
        </span>
      </div>
    </div>

    <!-- Description -->
    <div class="text-gray-700 text-sm leading-relaxed">
      {{ getSamplerDescription() }}
    </div>

    <!-- Additional info if available -->
    <div v-if="getAdditionalInfo()" class="mt-3 text-xs text-gray-500">
      {{ getAdditionalInfo() }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'SamplerItem',
  props: {
    beverage: {
      type: Object,
      required: true
    }
  },
  methods: {
    getSamplerTitle() {
      const name = this.beverage.fields.Name || ''

      // Extract the main title (YOU PICK, MANAGER'S CHOICE, etc.)
      if (name.toLowerCase().includes('you pick')) {
        return 'YOU PICK'
      } else if (name.toLowerCase().includes('manager')) {
        return "MANAGER'S CHOICE"
      }

      // Fallback to the full name
      return name.toUpperCase()
    },

    getSamplerDescription() {
      const name = this.beverage.fields.Name || ''

      if (name.toLowerCase().includes('you pick')) {
        return 'Choose any 4 draft beers • 5.5oz pours'
      } else if (name.toLowerCase().includes('manager')) {
        return '4 draft beers chosen for you • 5.5oz pours'
      }

      // Try to extract description from the name or use a generic description
      return 'Beer sampler with multiple draft selections'
    },

    getSamplerPrice() {
      const price = this.beverage.fields.Price
      return price ? price.toString() : '0'
    },

    getAdditionalInfo() {
      // Check for any additional notes or information
      const notes = this.beverage.fields.Notes
      if (notes && notes.length > 0) {
        return notes[0]
      }

      const volume = this.beverage.fields.Volume
      if (volume && volume.length > 0) {
        return `${volume[0]} total volume`
      }

      return null
    }
  }
}
</script>