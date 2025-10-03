<template>
  <div class="location-selector ">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center space-x-2 text-gray-600">
      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      <span class="text-sm">Loading locations...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-600 text-sm">
      Error loading locations: {{ error }}
    </div>

    <!-- Location Selector -->
    <div v-else-if="activeLocations.length > 0" class="flex items-center space-x-3">
      <!-- Label -->
      <span class="text-sm font-medium text-gray-700 whitespace-nowrap">
        {{ showLabel ? 'Showing items from:' : '' }}
      </span>

      <!-- Dropdown -->
      <div class="relative">
        <select
          :value="selectedLocationId"
          @change="handleLocationChange"
          :class="[
            'appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8',
            'text-sm font-medium text-gray-900 cursor-pointer',
            'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'transition-colors duration-200',
            sizeClass
          ]"
          :disabled="disabled"
        >
          <option value="" v-if="allowAllLocations">
            {{ isDebugMode ? 'All Locations (all)' : 'All Locations' }}
          </option>
          <option
            v-for="location in activeLocations"
            :key="location.id"
            :value="location.id"
          >
            {{ formatLocationName(location) }}
          </option>
        </select>

        <!-- Dropdown Arrow -->
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <!-- Selected Location Display (if compact) -->
      <div v-if="compact" class="flex items-center text-sm text-gray-600">
        <span class="font-medium text-blue-600">{{ selectedLocationName }}</span>
      </div>
    </div>

    <!-- No Locations Available -->
    <div v-else class="text-gray-500 text-sm">
      No locations available
    </div>
  </div>
</template>

<script>
import { computed, inject } from 'vue'
import locationService from '../services/location.js'
import { useUrlParams } from '../composables/useUrlParams.js'

export default {
  name: 'LocationSelector',
  props: {
    // Location filter composable data (injected or passed as props)
    selectedLocationId: {
      type: String,
      default: null
    },
    locations: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    },

    // Component configuration
    showLabel: {
      type: Boolean,
      default: true
    },
    allowAllLocations: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium', // 'small', 'medium', 'large'
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    compact: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['locationChanged'],
  setup(props, { emit }) {
    // Try to get location filter functions from injection (when used with composable)
    const locationFilter = inject('locationFilter', null)

    // Get debug mode state
    const { isDebugMode } = useUrlParams()

    // Computed properties
    const activeLocations = computed(() => {
      return props.locations.filter(location => locationService.isLocationActive(location))
    })

    const selectedLocationName = computed(() => {
      if (!props.selectedLocationId || !props.locations.length) {
        return isDebugMode.value ? 'All Locations (all)' : 'All Locations'
      }

      const location = props.locations.find(loc => loc.id === props.selectedLocationId)
      if (location) {
        const baseName = locationService.formatLocationName(location)
        if (isDebugMode.value) {
          const locationNumber = location.fields?.['Location Number'] || location.id
          const slug = locationService.getLocationSlug(location)
          return `${baseName} (ID: ${locationNumber}, Slug: ${slug})`
        }
        return baseName
      }
      return isDebugMode.value ? 'All Locations (all)' : 'All Locations'
    })

    const sizeClass = computed(() => {
      const sizes = {
        small: 'px-2 py-1 text-xs',
        medium: 'px-3 py-2 text-sm',
        large: 'px-4 py-3 text-base'
      }
      return sizes[props.size] || sizes.medium
    })

    // Methods
    const formatLocationName = (location) => {
      const baseName = locationService.formatLocationName(location)
      if (isDebugMode.value) {
        const locationNumber = location.fields?.['Location Number'] || location.id
        const slug = locationService.getLocationSlug(location)
        return `${baseName} (ID: ${locationNumber}, Slug: ${slug})`
      }
      return baseName
    }

    const handleLocationChange = (event) => {
      const newLocationId = event.target.value || null

      // Emit event for parent components
      emit('locationChanged', newLocationId)

      // If using with composable, call the composable method
      if (locationFilter && locationFilter.setSelectedLocation) {
        locationFilter.setSelectedLocation(newLocationId)
      }
    }

    return {
      activeLocations,
      selectedLocationName,
      sizeClass,
      formatLocationName,
      handleLocationChange,
      isDebugMode
    }
  }
}
</script>

<style scoped>
/* Custom styles for better dropdown appearance */
.location-selector select {
  background-image: none; /* Remove default browser dropdown arrow */
}

/* Focus states for better accessibility */
.location-selector select:focus {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Hover effect for better UX */
.location-selector select:hover:not(:disabled) {
  background-color: #f9fafb;
}

/* Disabled state */
.location-selector select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: #f3f4f6;
}
</style>