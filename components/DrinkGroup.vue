<template>
  <div class="drink-group max-w-[800px] mx-auto" :data-group-id="`${sectionId}-${groupId}`">
    <!-- Group Header -->
    <div class="mb-6">
      <h2 class="text-3xl px-4 font-medium text-gold-700 mb-3">
        {{ group.title }}
      </h2>
    </div>

    <!--  (for samplers, etc.) -->
    <div v-if="group.isCustomGroup && group.customItems" class="mb-14">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
        <div
          v-for="(item, index) in group.customItems"
          :key="index"
          class="rounded-lg px-4 py-2 md:p-4 transition-shadow"
        >
          <div class="flex justify-between items-start mb-2 md:mb-4">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900 text-base uppercase tracking-wide">
                {{ item.title }}
              </h3>
            </div>
            <div class="text-right ml-4">
              <span class="text-base  font-bold text-gray-900">
                {{ item.cost }}
              </span>
            </div>
          </div>
          <div class="text-gray-700 text-sm leading-relaxed mb-2">
            {{ item.text }} 
            <span> ⸱ </span>
            {{ item.size }}
          </div>
        </div>
      </div>
    </div>

    <!-- Beverages Grid -->
    <div v-else-if="group.beverages && group.beverages.length > 0" class="space-y-4 mb-14">
      <!-- Special handling for samplers -->
      <template v-if="group.isSpecialGroup && group.specialType === 'sampler'">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
          <SamplerItem
            v-for="beverage in group.beverages"
            :key="beverage.id"
            :beverage="beverage"
          />
        </div>
      </template>

      <!-- Wine items (grouped by base name) -->
      <template v-else-if="isWineGroup">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
          <WineItem
            v-for="wineGroup in wineGroups"
            :key="wineGroup.baseName"
            :wine-group="wineGroup"
          />
        </div>
      </template>

      <!-- Regular beverage items -->
      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-6 mb-14">
          <BeverageItem
            v-for="beverage in group.beverages"
            :key="beverage.id"
            :beverage="beverage"
            :show-format-info="!isWineGroup && !isCocktailGroup"
            :hide-glass-info="isCocktailGroup"
          />
        </div>
      </template>
    </div>

    <!-- Empty state -->
    <div v-else class="text-center py-8 text-gray-500">
      No beverages available in this group
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import BeverageItem from './BeverageItem.vue'
import WineItem from './WineItem.vue'
import SamplerItem from './SamplerItem.vue'
import { groupWinesByBaseName } from '../utils/beverageOrganizer.js'

export default {
  name: 'DrinkGroup',
  components: {
    BeverageItem,
    WineItem,
    SamplerItem
  },
  props: {
    group: {
      type: Object,
      required: true
    },
    groupId: {
      type: String,
      required: true
    },
    sectionId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const isWineGroup = computed(() => {
      // Check multiple ways to identify wine groups
      return props.sectionId === 'wine' ||
             (props.group.beverageType && (
               props.group.beverageType === 'Wine' ||
               props.group.beverageType === 'Red Wine' ||
               props.group.beverageType === 'White Wine' ||
               props.group.beverageType === 'Blush'
             )) ||
             (props.group.categories && props.group.categories.some(cat => cat.includes('Wine')))
    })

    const isCocktailGroup = computed(() => {
      return props.group.categories && props.group.categories.includes('Cocktails')
    })

    const wineGroups = computed(() => {
      if (!isWineGroup.value || !props.group.beverages) return []

      const grouped = groupWinesByBaseName(props.group.beverages)
      return Object.values(grouped)
    })

    return {
      isWineGroup,
      isCocktailGroup,
      wineGroups
    }
  }
}
</script>