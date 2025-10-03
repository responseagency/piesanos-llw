<template>
  <!-- Sticky Header -->
  <div class="sticky top-0 z-40 bg-white shadow-sm border-b">
    <div class="max-w-[1024px] mx-auto px-4 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 class="text-3xl font-bold text-gray-900">Beverage Menu</h1>

        <!-- Location Selector -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-4">
          <LocationSelector
            :selected-location-id="selectedLocationId"
            :locations="locations"
            :loading="locationLoading"
            :error="locationError"
            :show-label="true"
            size="medium"
            @location-changed="$emit('location-changed', $event)"
          />

          <div class="text-sm text-gray-600 whitespace-nowrap">
            Last updated: {{ lastUpdated || 'Never' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import LocationSelector from './LocationSelector.vue'

export default {
  name: 'StickyHeader',
  components: {
    LocationSelector
  },
  props: {
    selectedLocationId: {
      type: String,
      required: true
    },
    locations: {
      type: Array,
      required: true
    },
    locationLoading: {
      type: Boolean,
      default: false
    },
    locationError: {
      type: String,
      default: null
    },
    lastUpdated: {
      type: String,
      default: null
    }
  },
  emits: ['location-changed']
}
</script>