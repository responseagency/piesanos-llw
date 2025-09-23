<template>
  <div class="beer-section mb-12">
    <!-- Main Beer Heading -->
    <div class="mb-8 border-l-4 border-amber-600 pl-6 ml-2">
      <h1 class="text-4xl font-bold text-gray-900 mb-2">🍺 Beer</h1>
      <div class="text-lg text-gray-600">
        {{ totalBeerCount }} beers available
        <span v-if="avgBeerPrice > 0">
          • Average: ${{ avgBeerPrice }}
        </span>
      </div>
    </div>

    <!-- Beer Subcategories -->
    <div class="space-y-8 ml-8">
      <BeverageSection
        v-for="(beverages, subcategory) in beerSubcategories"
        :key="subcategory"
        :type="getSubcategoryDisplayName(subcategory)"
        :beverages="beverages"
        :stats="stats[subcategory] || {}"
        :is-subcategory="true"
      />
    </div>
  </div>
</template>

<script>
import BeverageSection from './BeverageSection.vue'

export default {
  name: 'BeerSection',
  components: {
    BeverageSection
  },
  props: {
    beerSubcategories: {
      type: Object,
      required: true
    },
    stats: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    totalBeerCount() {
      return Object.values(this.beerSubcategories).reduce((total, beers) => total + beers.length, 0)
    },

    avgBeerPrice() {
      const allBeers = Object.values(this.beerSubcategories).flat()
      const prices = allBeers.map(beer => beer.fields.Price || 0).filter(p => p > 0)

      if (prices.length === 0) return 0

      const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length
      return avg.toFixed(2)
    }
  },
  methods: {
    getSubcategoryDisplayName(subcategory) {
      // Remove "Beer - " prefix for subcategory display
      return subcategory.replace('Beer - ', '')
    }
  }
}
</script>