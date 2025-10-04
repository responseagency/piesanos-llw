<template>
  <div class="fixed bottom-4 left-4 z-50">
    <!-- Collapsed State: Small Floating Button -->
    <button
      v-if="!isExpanded"
      @click="isExpanded = true"
      class="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 px-3 py-2 rounded-lg shadow-lg font-semibold text-xs flex items-center gap-2 transition-all"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      Debug
    </button>

    <!-- Expanded State: Compact Panel -->
    <div
      v-else
      class="bg-white border-2 border-yellow-400 rounded-lg shadow-xl w-[320px] max-h-[600px] overflow-hidden flex flex-col"
    >
      <!-- Header -->
      <div class="bg-yellow-400 px-3 py-2 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-yellow-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="font-bold text-sm text-yellow-900">Debug Panel</span>
        </div>
        <button
          @click="isExpanded = false"
          class="text-yellow-900 hover:text-yellow-950 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="overflow-y-auto flex-1 p-3 space-y-3 text-xs">
        <!-- Location Selector -->
        <div class="bg-gray-50 rounded p-2">
          <label class="block text-gray-700 font-semibold mb-1">Location</label>
          <select
            :value="selectedLocationId"
            @change="handleLocationChange"
            :disabled="locationLoading"
            class="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-white disabled:bg-gray-100"
          >
            <option value="all">All Locations</option>
            <option
              v-for="location in locations"
              :key="location.id"
              :value="location.id"
            >
              {{ location.fields['Location Name'] || location.fields.Name || 'Unnamed Location' }}
            </option>
          </select>
          <div v-if="locationError" class="text-red-600 mt-1">{{ locationError }}</div>
        </div>

        <!-- Last Updated -->
        <div class="bg-gray-50 rounded p-2">
          <div class="text-gray-600">
            <span class="font-semibold">Last Updated:</span>
            <div class="text-gray-800 mt-0.5">{{ lastUpdated || 'Never' }}</div>
          </div>
        </div>

        <!-- Stats Summary -->
        <div class="bg-blue-50 rounded p-2 border border-blue-200">
          <div class="font-semibold text-blue-800 mb-1.5">Quick Stats</div>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="(stats, type) in beverageStats"
              :key="type"
              class="text-center bg-white rounded p-1.5"
            >
              <div class="text-lg font-bold text-gray-900">{{ stats.count }}</div>
              <div class="text-xs text-gray-600 leading-tight">{{ type }}</div>
            </div>
          </div>

          <!-- Category Mapping Stats -->
          <div v-if="mappingStats" class="mt-2 pt-2 border-t border-blue-200">
            <div class="text-blue-700 font-semibold mb-1">Mapping</div>
            <div class="grid grid-cols-2 gap-1.5">
              <div class="bg-white rounded p-1 text-center">
                <div class="font-bold text-blue-600">{{ mappingStats.totalCategories }}</div>
                <div class="text-blue-700">Total</div>
              </div>
              <div class="bg-white rounded p-1 text-center">
                <div class="font-bold text-green-600">{{ mappingStats.dynamicallyMapped }}</div>
                <div class="text-green-700">Auto</div>
              </div>
              <div class="bg-white rounded p-1 text-center">
                <div class="font-bold text-yellow-600">{{ mappingStats.fallbackMapped }}</div>
                <div class="text-yellow-700">Manual</div>
              </div>
              <div class="bg-white rounded p-1 text-center">
                <div class="font-bold text-red-600">{{ mappingStats.unmapped }}</div>
                <div class="text-red-700">Unmapped</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Controls -->
        <div class="bg-gray-50 rounded p-2">
          <div class="font-semibold text-gray-700 mb-1.5">Filters</div>
          <div class="space-y-2">
            <label class="flex items-center">
              <input
                :checked="showOnlyAvailable"
                @change="$emit('update:showOnlyAvailable', $event.target.checked)"
                type="checkbox"
                class="mr-2"
              >
              <span>Show only available</span>
            </label>
            <label class="flex items-center gap-2">
              <span class="whitespace-nowrap">Sort by:</span>
              <select
                :value="sortBy"
                @change="$emit('update:sortBy', $event.target.value)"
                class="flex-1 border border-gray-300 rounded px-2 py-1 text-xs bg-white"
              >
                <option value="name">Name</option>
                <option value="price-asc">Price (Low-High)</option>
                <option value="price-desc">Price (High-Low)</option>
              </select>
            </label>
          </div>
        </div>

        <!-- Refresh Button -->
        <div>
          <button
            @click="$emit('refresh')"
            :disabled="isRefreshing"
            class="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition-colors"
          >
            <svg
              v-if="isRefreshing"
              class="animate-spin h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isRefreshing ? 'Refreshing...' : 'Refresh Data' }}
          </button>

          <!-- Refresh Message -->
          <div
            v-if="refreshMessage"
            class="mt-2 px-2 py-1.5 rounded text-xs leading-tight"
            :class="refreshError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'"
          >
            {{ refreshMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import locationService from '../services/location.js'

export default {
  name: 'DebugPanel',
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
    },
    beverageStats: {
      type: Object,
      required: true,
      default: () => ({})
    },
    mappingStats: {
      type: Object,
      default: null
    },
    showOnlyAvailable: {
      type: Boolean,
      required: true
    },
    sortBy: {
      type: String,
      required: true
    },
    isRefreshing: {
      type: Boolean,
      default: false
    },
    refreshMessage: {
      type: String,
      default: ''
    },
    refreshError: {
      type: Boolean,
      default: false
    }
  },
  emits: ['location-changed', 'update:showOnlyAvailable', 'update:sortBy', 'refresh'],
  setup(props) {
    const isExpanded = ref(false)
    const router = useRouter()

    const handleLocationChange = (event) => {
      const locationId = event.target.value

      if (locationId === 'all') {
        // Navigate to home page
        router.push('/')
      } else {
        // Find the location and generate its slug
        const location = props.locations.find(loc => loc.id === locationId)
        if (location) {
          const slug = locationService.getLocationSlug(location)
          router.push(`/${slug}`)
        }
      }
    }

    return {
      isExpanded,
      handleLocationChange
    }
  }
}
</script>
