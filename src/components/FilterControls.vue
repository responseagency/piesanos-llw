<template>
  <div class="bg-white rounded-lg shadow-sm border p-4 mb-8">
    <div class="flex flex-wrap gap-4 items-center">
      <label class="flex items-center">
        <input
          :checked="showOnlyAvailable"
          @change="$emit('update:showOnlyAvailable', $event.target.checked)"
          type="checkbox"
          class="mr-2"
        >
        <span class="text-sm">Show only available items</span>
      </label>
      <label class="flex items-center">
        <span class="text-sm mr-2">Sort by:</span>
        <select
          :value="sortBy"
          @change="$emit('update:sortBy', $event.target.value)"
          class="border rounded px-2 py-1 text-sm"
        >
          <option value="name">Name</option>
          <option value="price-asc">Price (Low to High)</option>
          <option value="price-desc">Price (High to Low)</option>
        </select>
      </label>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FilterControls',
  props: {
    showOnlyAvailable: {
      type: Boolean,
      required: true
    },
    sortBy: {
      type: String,
      required: true
    }
  },
  emits: ['update:showOnlyAvailable', 'update:sortBy']
}
</script>