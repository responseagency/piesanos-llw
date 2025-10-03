<template>
  <div
    v-if="showBar && promoContent"
    class="sticky top-0 z-50 promo-bar text-gold-50 py-3 px-4"
  >
    <div class="max-w-7xl mx-auto flex items-center justify-center">
      <div class="flex items-center gap-2 text-center">
        <p class="text-sm font-medium">{{ promoContent }}</p>
        <a
          v-if="ctaText && ctaLink"
          :href="ctaLink"
          class="text-sm font-medium underline hover:text-gold-200 transition-colors whitespace-nowrap"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ ctaText }}
        </a>
      </div>
      <button
        @click="closeBar"
        class="ml-4 text-gold-50 hover:text-gold-200 transition-colors flex-shrink-0"
        aria-label="Close promo banner"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, inject } from 'vue'

export default {
  name: 'PromoBar',
  setup() {
    // Inject location filter from parent
    const locationFilter = inject('locationFilter', null)

    // State for managing the promo bar visibility
    const closedForLocations = ref(new Set())

    // Get the current selected location
    const selectedLocation = computed(() => {
      return locationFilter?.selectedLocation?.value || null
    })

    // Get promo content for current location
    const promoContent = computed(() => {
      if (!selectedLocation.value) return null

      // Only show promo if there's actual Promo Text
      return selectedLocation.value.fields?.['Promo Text'] || null
    })

    // Get CTA text for current location
    const ctaText = computed(() => {
      if (!selectedLocation.value) return null
      return selectedLocation.value.fields?.['Promo CTA'] || null
    })

    // Get CTA link for current location
    const ctaLink = computed(() => {
      if (!selectedLocation.value) return null
      return selectedLocation.value.fields?.['Promo URL'] || null
    })

    // Determine if bar should be shown
    const showBar = computed(() => {
      if (!selectedLocation.value || !promoContent.value) return false

      // Don't show if user has closed it for this location
      return !closedForLocations.value.has(selectedLocation.value.id)
    })

    // Close the bar for current location
    const closeBar = () => {
      if (selectedLocation.value) {
        closedForLocations.value.add(selectedLocation.value.id)
      }
    }

    // Watch for location changes to potentially re-show the bar
    watch(
      () => selectedLocation.value?.id,
      (newLocationId, oldLocationId) => {
        // When location changes, the bar will automatically show again
        // if it hasn't been closed for the new location
        if (newLocationId !== oldLocationId) {
          // Bar visibility is computed, so it will update automatically
        }
      }
    )

    return {
      showBar,
      promoContent,
      ctaText,
      ctaLink,
      closeBar
    }
  }
}
</script>

<style scoped>
.promo-bar {
  background: linear-gradient(90deg, #420E0D 0%, #611918 76.92%, #832524 100%);
}
</style>